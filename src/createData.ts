import fs from 'fs';
import path from 'path';

// Determine the correct path based on the environment
const isProduction = process.env.NODE_ENV === 'production';
const dataFolderPath = isProduction 
    ? path.join(__dirname, 'data') // Running in dist
    : path.join(__dirname, '../data'); // Running in src

// Function to create the data directory
const createDataFolder = () => {
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath, { recursive: true });
        console.log('Data folder created at:', dataFolderPath);
        
        // Create the searchHistory.json file
        const searchHistoryFilePath = path.join(dataFolderPath, 'searchHistory.json');
        fs.writeFileSync(searchHistoryFilePath, JSON.stringify([]), 'utf8');
        console.log('searchHistory.json created.');
    } else {
        console.log('Data folder already exists:', dataFolderPath);
    }
};

// Call the function to create the data folder and file
createDataFolder();