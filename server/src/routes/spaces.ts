import { Router, Request, Response } from 'express';
import { spacesDb } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { type } = req.query as { type?: string };
  const query: Record<string, unknown> = { _type: 'space' };
  if (type) query.types = type;
  try {
    const spaces = await spacesDb.find(query).sort({ createdAt: 1 }).execAsync();
    res.json({ spaces });
  } catch {
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const space = await spacesDb.findOneAsync({ _id: req.params.id, _type: 'space' });
    if (!space) { res.status(404).json({ error: 'Space not found' }); return; }
    res.json({ space });
  } catch {
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, types, capacity, locationEn, locationKo, hourlyRate, emoji, thumbColor, unavailable, contactEmail, contactPhone } =
    req.body as {
      name?: string;
      types?: string[];
      capacity?: number;
      locationEn?: string;
      locationKo?: string;
      hourlyRate?: number;
      emoji?: string;
      thumbColor?: string;
      unavailable?: Record<string, number[]>;
      contactEmail?: string;
      contactPhone?: string;
    };

  if (!name?.trim() || !types?.length || !capacity || !locationEn?.trim() || !locationKo?.trim() || !hourlyRate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const duplicate = await spacesDb.findOneAsync({ _type: 'space', name: name.trim() });
    if (duplicate) {
      res.status(409).json({ error: 'A space with this name already exists.' });
      return;
    }

    const space = await spacesDb.insertAsync({
      _type: 'space',
      name: name.trim(),
      types,
      capacity: Number(capacity),
      locationEn: locationEn.trim(),
      locationKo: locationKo.trim(),
      hourlyRate: Number(hourlyRate),
      emoji: emoji?.trim() || '🏢',
      thumbColor: thumbColor?.trim() || '#E6FAF9',
      unavailable: unavailable ?? {},
      contactEmail: contactEmail?.trim() ?? '',
      contactPhone: contactPhone?.trim() ?? '',
      createdAt: new Date(),
    });
    res.status(201).json({ space });
  } catch {
    res.status(500).json({ error: 'Failed to create space' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, types, capacity, locationEn, locationKo, hourlyRate, emoji, thumbColor, unavailable, contactEmail, contactPhone } =
    req.body as {
      name?: string;
      types?: string[];
      capacity?: number;
      locationEn?: string;
      locationKo?: string;
      hourlyRate?: number;
      emoji?: string;
      thumbColor?: string;
      unavailable?: Record<string, number[]>;
      contactEmail?: string;
      contactPhone?: string;
    };

  if (!name?.trim() || !types?.length || !capacity || !locationEn?.trim() || !locationKo?.trim() || !hourlyRate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const duplicate = await spacesDb.findOneAsync({ _type: 'space', name: name.trim() });
    if (duplicate && duplicate._id !== id) {
      res.status(409).json({ error: 'A space with this name already exists.' });
      return;
    }

    const numAffected = await spacesDb.updateAsync(
      { _id: id, _type: 'space' },
      {
        $set: {
          name: name.trim(),
          types,
          capacity: Number(capacity),
          locationEn: locationEn.trim(),
          locationKo: locationKo.trim(),
          hourlyRate: Number(hourlyRate),
          emoji: emoji?.trim() || '🏢',
          thumbColor: thumbColor?.trim() || '#E6FAF9',
          unavailable: unavailable ?? {},
          contactEmail: contactEmail?.trim() ?? '',
          contactPhone: contactPhone?.trim() ?? '',
        },
      },
      {}
    );
    if (!numAffected) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update space' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const numRemoved = await spacesDb.removeAsync({ _id: id, _type: 'space' }, {});
    if (!numRemoved) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

export default router;
