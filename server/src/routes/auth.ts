import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersDb } from '../db';
import { JWT_SECRET } from '../config';

const router = Router();

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  createdAt: Date;
}

router.post('/signup', async (req: Request, res: Response) => {
  const { username, email, phone, password } = req.body as {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }
  if (username.trim().length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await usersDb.insertAsync({
      username: username.trim(),
      email: email.trim(),
      phone: phone?.trim() ?? '',
      password: hashed,
      createdAt: new Date(),
    }) as User;

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone ?? '' } });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errorType' in err && (err as { errorType: string }).errorType === 'uniqueViolated') {
      res.status(409).json({ error: 'Username already taken' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = await usersDb.findOneAsync({ username: username.trim() }) as User | null;
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone ?? '' } });
});

router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id: string; username: string };
    res.json({ user: { id: payload.id, username: payload.username } });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
