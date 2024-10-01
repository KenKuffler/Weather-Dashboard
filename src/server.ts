import express, { Request, Response, NextFunction } from 'express'; // Import NextFunction for error handling
import dotenv from 'dotenv';
import weatherRoutes from './routes/weatherRoutes';
import path from 'path';

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files (index.html and jass.css) from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Weather-related API routes
app.use('/api/weather', weatherRoutes);

// Fallback route to serve index.html for any unknown route
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err.message); // Log the error message to the console
  res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 status
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});