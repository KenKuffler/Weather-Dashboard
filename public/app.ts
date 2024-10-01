const form = document.getElementById('cityForm') as HTMLFormElement;
const cityInput = document.getElementById('cityInput') as HTMLInputElement;
const currentWeatherContainer = document.getElementById('currentWeather') as HTMLElement;
const forecastContainer = document.getElementById('forecast') as HTMLElement;
const searchHistoryList = document.getElementById('searchHistory') as HTMLElement;

// Function to fetch weather data
const fetchWeatherData = async (city: string) => {
    try {
        // Save city to search history
        const saveCityResponse = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city }),
        });

        // Check if the response is OK
        if (!saveCityResponse.ok) {
            const errorMessage = await saveCityResponse.json(); // Get error details
            throw new Error(`Failed to save city: ${errorMessage.error}`);
        }

        // Get weather data
        const response = await fetch('/api/weather/history');
        
        // Check if the response is OK
        if (!response.ok) {
            const errorMessage = await response.json(); // Get error details
            throw new Error(`Failed to fetch weather data: ${errorMessage.error}`);
        }

        const weatherData = await response.json();

        // Display current weather and forecast
        displayWeather(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('There was an issue fetching the weather data. Please try again.'); // Optional user feedback
    }
};

// Function to display current weather and forecast
const displayWeather = (weatherData: any) => {
    const currentWeather = weatherData.current; // Adjust according to your data structure
    const dailyForecast = weatherData.daily.slice(1, 6); // Get the next 5 days

    // Display current weather
    currentWeatherContainer.innerHTML = `
        <h3>${weatherData.city} (${new Date(currentWeather.dt * 1000).toLocaleDateString()})</h3>
        <p><img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png" alt="${currentWeather.weather[0].description}"></p>
        <p>Temperature: ${currentWeather.temp}°F</p>
        <p>Humidity: ${currentWeather.humidity}%</p>
        <p>Wind Speed: ${currentWeather.wind_speed} mph</p>
    `;

    // Display 5-day forecast
    forecastContainer.innerHTML = '';
    dailyForecast.forEach((day: any) => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
            <p><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}"></p>
            <p>Temperature: ${day.temp.day}°F</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind Speed: ${day.wind_speed} mph</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
};

// Event listener for form submission
form.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        cityInput.value = ''; // Clear input
    } else {
        alert('Please enter a city name.'); // Optional user feedback for empty input
    }
});

// Function to load search history
const loadSearchHistory = async () => {
    try {
        const response = await fetch('/api/weather/history');

        // Check if the response is OK
        if (!response.ok) {
            const errorMessage = await response.json(); // Get error details
            throw new Error(`Failed to load search history: ${errorMessage.error}`);
        }

        const searchHistory = await response.json();
        searchHistoryList.innerHTML = '';

        searchHistory.forEach((city: any) => {
            const listItem = document.createElement('li');
            listItem.textContent = city.name;
            listItem.addEventListener('click', () => {
                fetchWeatherData(city.name);
            });
            searchHistoryList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading search history:', error);
        alert('There was an issue loading the search history. Please try again.'); // Optional user feedback
    }
};

// Load search history on page load
loadSearchHistory();