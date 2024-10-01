import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // To generate unique IDs
import dotenv from 'dotenv'; // Import dotenv

// Initialize dotenv to load environment variables
dotenv.config();

const apiKey = process.env.OPENWEATHER_API_KEY;
const searchHistoryFile = path.join(__dirname, '../data/searchHistory.json');

// Helper function to get coordinates for a city from OpenWeather API
const getCityCoordinates = async (city: string) => {
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  const response = await axios.get(geoUrl);
  if (response.data.length > 0) {
    const { lat, lon } = response.data[0];
    return { lat, lon };
  }
  throw new Error('City not found');
};

// Controller to handle saving a city to the search history
export const saveCity = (req: Request, res: Response, next: NextFunction) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const cityData = { id: uuidv4(), name: city };

  // Read the current search history
  fs.readFile(searchHistoryFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read search history' });
    }

    const searchHistory = data ? JSON.parse(data) : [];
    searchHistory.push(cityData);

    // Write the updated search history back to the file
    fs.writeFile(searchHistoryFile, JSON.stringify(searchHistory, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save city to search history' });
      }
      next(); // Proceed to the next middleware to get weather data
    });
  });
};

// Controller to retrieve weather data for a city
export const getWeatherData = async (req: Request, res: Response) => {
  const { city } = req.body;

  try {
    const { lat, lon } = await getCityCoordinates(city);
    console.log(`Coordinates for ${city}: lat=${lat}, lon=${lon}`); // Log coordinates

    // Call the One Call 3.0 API for weather data
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    const weatherResponse = await axios.get(weatherUrl);

    console.log(`Weather data retrieved for ${city}:`, weatherResponse.data); // Log weather data
    res.json(weatherResponse.data);
  } catch (error: unknown) { // Specify the type of error as unknown
    console.error('Error fetching weather data:', (error as Error).message); // Type assertion
    if (axios.isAxiosError(error)) {
      // Log specific Axios error response
      console.error('Axios error response:', error.response?.data);
    }
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
};

// Controller to get the search history
export const getSearchHistory = (req: Request, res: Response) => {
    console.log('Fetching search history...'); // Debug log
    fs.readFile(searchHistoryFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading search history:', err); // Log the error
        return res.status(500).json({ error: 'Failed to read search history' });
      }
  
      let searchHistory;
      try {
        searchHistory = data ? JSON.parse(data) : [];
        console.log('Search history data read:', searchHistory); // Log the data
      } catch (jsonError: unknown) { // Specify the type of jsonError as unknown
        console.error('Error parsing search history JSON:', (jsonError as Error).message); // Type assertion
        return res.status(500).json({ error: 'Failed to parse search history' });
      }
  
      // Ensure searchHistory is an array
      if (!Array.isArray(searchHistory)) {
        console.error('Search history is not an array:', searchHistory); // Log the invalid data
        return res.status(500).json({ error: 'Search history is not an array' });
      }
  
      res.json(searchHistory);
    });
  };