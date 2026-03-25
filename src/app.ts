import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to EcoSpark_Hub API' });
});

// Better-Auth handler for authentication routes (/api/auth/*)
app.all("/api/auth/*", toNodeHandler(auth));

export default app;
