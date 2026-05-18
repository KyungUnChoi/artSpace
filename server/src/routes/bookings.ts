import { Router, Request, Response } from 'express';
import { spacesDb, bookingsDb, recordEvent } from '../db';
import { sendBookingRequestEmail } from '../utils/email';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: returns the 4 most recently requested spaces (no personal info).
router.get('/recent-public', async (_req: Request, res: Response) => {
  try {
    const recent = await bookingsDb
      .find({ _type: 'booking' })
      .sort({ createdAt: -1 })
      .limit(40)
      .execAsync() as unknown as { spaceId: string; spaceName: string }[];

    // Deduplicate — show each space only once, keep max 10
    const seen = new Set<string>();
    const deduped = recent.filter(b => {
      if (seen.has(b.spaceId)) return false;
      seen.add(b.spaceId);
      return true;
    }).slice(0, 10);

    const enriched = await Promise.all(deduped.map(async b => {
      const space = await spacesDb.findOneAsync({ _id: b.spaceId, _type: 'space' }) as {
        types?: string[]; locationEn?: string;
      } | null;
      return {
        spaceName: b.spaceName,
        spaceTypes: space?.types ?? [],
        city: space?.locationEn?.split(',').pop()?.trim() ?? '',
      };
    }));

    res.json({ bookings: enriched });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Public: returns only { date → hours[] } for pending bookings on a space.
// No personal info exposed.
router.get('/pending-hours', async (req: Request, res: Response) => {
  const { spaceId } = req.query as { spaceId?: string };
  if (!spaceId) { res.status(400).json({ error: 'spaceId required' }); return; }
  try {
    const bookings = await bookingsDb.find({ _type: 'booking', spaceId, status: 'pending' }).execAsync() as unknown as { date: string; hours: number[] }[];
    const pendingHours: Record<string, number[]> = {};
    for (const b of bookings) {
      if (!pendingHours[b.date]) pendingHours[b.date] = [];
      for (const h of b.hours) {
        if (!pendingHours[b.date].includes(h)) pendingHours[b.date].push(h);
      }
    }
    res.json({ pendingHours });
  } catch {
    res.status(500).json({ error: 'Failed to fetch pending hours' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { spaceId, status } = req.query as { spaceId?: string; status?: string };
  const query: Record<string, string> = { _type: 'booking' };
  if (spaceId) query.spaceId = spaceId;
  if (status)  query.status  = status;
  try {
    const bookings = await bookingsDb.find(query).sort({ createdAt: -1 }).execAsync();
    res.json({ bookings });
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/:id/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await bookingsDb.findOneAsync({ _id: req.params.id, _type: 'booking' }) as {
      _id: string; spaceId: string; date: string; hours: number[]; status: string;
    } | null;
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }

    await bookingsDb.updateAsync({ _id: req.params.id }, { $set: { status: 'approved' } }, {});
    recordEvent('booking_confirmed', { bookingId: req.params.id });

    const space = await spacesDb.findOneAsync({ _id: booking.spaceId, _type: 'space' }) as {
      _id: string; unavailable: Record<string, number[]>;
    } | null;
    if (space) {
      const unavailable: Record<string, number[]> = space.unavailable ?? {};
      const existing = unavailable[booking.date] ?? [];
      unavailable[booking.date] = [...new Set([...existing, ...booking.hours])];
      await spacesDb.updateAsync({ _id: booking.spaceId }, { $set: { unavailable } }, {});
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

router.post('/:id/decline', requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await bookingsDb.findOneAsync({ _id: req.params.id, _type: 'booking' });
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    await bookingsDb.updateAsync({ _id: req.params.id }, { $set: { status: 'declined' } }, {});
    recordEvent('booking_declined', { bookingId: req.params.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to decline booking' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { spaceId, date, hours, requesterName, requesterEmail, message } = req.body as {
    spaceId?: string;
    date?: string;
    hours?: number[];
    requesterName?: string;
    requesterEmail?: string;
    message?: string;
  };

  if (!spaceId || !date || !hours?.length || !requesterName?.trim() || !requesterEmail?.trim()) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const space = await spacesDb.findOneAsync({ _id: spaceId, _type: 'space' });
    if (!space) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }

    const booking = await bookingsDb.insertAsync({
      _type: 'booking',
      spaceId,
      spaceName: space.name,
      date,
      hours,
      requesterName: requesterName.trim(),
      requesterEmail: requesterEmail.trim(),
      message: message?.trim() ?? '',
      status: 'pending',
      createdAt: new Date(),
    });

    recordEvent('booking_request', { bookingId: booking._id as string, spaceId, date, hourCount: hours.length });

    if (space.contactEmail) {
      sendBookingRequestEmail(space.contactEmail, {
        spaceName: space.name,
        date,
        hours,
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim(),
        message: message?.trim() ?? '',
      }).catch(err => console.error('Email send failed:', err));
    }

    res.status(201).json({ booking });
  } catch {
    res.status(500).json({ error: 'Failed to create booking request' });
  }
});

export default router;
