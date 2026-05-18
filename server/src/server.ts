import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import spacesRouter from './routes/spaces';
import bookingsRouter from './routes/bookings';
import { seedSpacesIfEmpty, spacesDb, appEventsDb } from './db';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);

function buildMonthlyStats(events: { createdAt: unknown }[]): { label: string; count: number }[] {
  const now = new Date();
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return { label: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), count: 0 };
  });
  for (const ev of events) {
    const d = new Date(ev.createdAt as string | Date);
    const slot = slots.find(s => s.year === d.getFullYear() && s.month === d.getMonth());
    if (slot) slot.count++;
  }
  return slots.map(({ label, count }) => ({ label, count }));
}

app.get('/api/stats', async (_req, res) => {
  try {
    const [totalSpaces, bookingsRequested, bookingsConfirmed, allSpaces, requestEvents] = await Promise.all([
      spacesDb.countAsync({ _type: 'space' }),
      appEventsDb.countAsync({ eventType: 'booking_request' }),
      appEventsDb.countAsync({ eventType: 'booking_confirmed' }),
      spacesDb.findAsync({ _type: 'space' }) as Promise<{ locationEn?: string }[]>,
      appEventsDb.findAsync({ eventType: 'booking_request' }) as Promise<{ createdAt: unknown }[]>,
    ]);
    const totalCities = new Set(
      allSpaces.map(s => s.locationEn?.split(',').pop()?.trim()).filter(Boolean)
    ).size;
    const monthly = buildMonthlyStats(requestEvents);
    res.json({ totalSpaces, bookingsRequested, bookingsConfirmed, totalCities, monthly });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const staticDir = path.join(__dirname, '../../client/public');
app.use(express.static(staticDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

seedSpacesIfEmpty().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
