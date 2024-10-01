import { Router } from 'express';
import { getWeatherData, getSearchHistory, saveCity } from '../controllers/weatherController';

const router = Router();

// Route to get the search history of cities
router.get('/history', getSearchHistory);

// Route to get weather data for a specific city and save it to the search history
router.post('/', saveCity, getWeatherData);

export default router;