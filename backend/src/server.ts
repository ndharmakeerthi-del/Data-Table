import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';
import productRoutes from './routes/productRoutes';
import localProductRoutes from './routes/localProductRoutes';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import registerRoutes from './routes/registerRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow any localhost port for development
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        
        // In production, you would check against a whitelist
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies to be sent
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/APIIntegrationDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Add a root endpoint for testing
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/products', productRoutes);
app.use('/api/local-products', localProductRoutes);
app.use('/api/register', registerRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});