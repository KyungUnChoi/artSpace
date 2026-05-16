import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import spacesRouter from './routes/spaces';
import bookingsRouter from './routes/bookings';
import { seedSpacesIfEmpty } from './db';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);

const staticDir = path.join(__dirname, '../../client/public');
app.use(express.static(staticDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

seedSpacesIfEmpty().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
