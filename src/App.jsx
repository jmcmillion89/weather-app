import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [location, setLocation] = useState('Charleston, WV');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [units, setUnits] = useState('imperial'); // State for unit system

  const fetchWeather = async (event) => {
    if (event) event.preventDefault(); // Prevent form submission from reloading the page
    try {
      const params = {
        appid: '34b89bc6de68a5b6e23e7563a6530f02', // Replace with your OpenWeather API key
        units: units
      };

      // Check if the input is a ZIP code (5-digit number)
      if (/^\d{5}$/.test(location)) {
        params.zip = location;
      } else {
        params.q = `${location},US`;
      }

      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params });
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', { params });
      const forecastData = forecastResponse.data.list;

      // Process forecast data to get daily forecasts
      const dailyForecasts = [];
      for (let i = 0; i < forecastData.length; i += 8) {
        dailyForecasts.push(forecastData[i]);
      }
      setForecast(dailyForecasts.slice(0, 3)); // Get the next 3 days

      // Update the title with the weather icon
      if (weatherResponse.data.weather && weatherResponse.data.weather[0]) {
        const iconUrl = `http://openweathermap.org/img/wn/${weatherResponse.data.weather[0].icon}@2x.png`;
        document.title = `Weather App - ${weatherResponse.data.weather[0].description}`;
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = iconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    fetchWeather();
    setBackgroundBasedOnTime();
  }, [units]); // Refetch weather data when units change

  const toggleUnits = () => {
    setUnits(units === 'imperial' ? 'metric' : 'imperial');
  };

  const getBackgroundColor = (description) => {
    if (description.includes('rain')) {
      return '#a4b0be';
    } else if (description.includes('cloud')) {
      return '#dfe4ea';
    } else if (description.includes('clear')) {
      return '#f1c40f';
    } else {
      return '#ffffff';
    }
  };

  const capitalizeDescription = (description) => {
    return description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const setBackgroundBasedOnTime = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      document.body.style.backgroundColor = '#87CEEB'; // Light blue for day
    } else {
      document.body.style.backgroundColor = '#2c3e50'; // Dark color for night
    }
  };

  return (
    <div className="app-container">
      <h1>Weather App</h1>
      <form onSubmit={fetchWeather} className="input-container">
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter city and state or ZIP code"
        />
        <button type="submit" className="fetch-button">
          Get Weather
        </button>
        <button type="button" onClick={toggleUnits} className="unit-toggle-button">
          Switch to {units === 'imperial' ? 'Metric' : 'Imperial'}
        </button>
      </form>
      {weather ? (
        <div className="current-weather" style={{ backgroundColor: getBackgroundColor(weather.weather[0].description) }}>
          <img src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} alt={weather.weather[0].description} />
          <h2>Current Weather in {weather.name}</h2>          
          <p>Temperature: {Math.round(weather.main.temp)}°{units === 'imperial' ? 'F' : 'C'}</p>
          <p>Weather: {capitalizeDescription(weather.weather[0].description)}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {Math.round(weather.wind.speed)} {units === 'imperial' ? 'mph' : 'm/s'}</p>
          <p>Pressure: {weather.main.pressure} hPa</p>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
      {forecast.length > 0 ? (
        <div className="forecast-container">
          <h2>3-Day Forecast</h2>
          <div className="forecast-cards">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card" style={{ backgroundColor: getBackgroundColor(day.weather[0].description) }}>
                <h3>{new Date(day.dt_txt).toLocaleDateString()}</h3>
                <p>Temperature: {Math.round(day.main.temp)}°{units === 'imperial' ? 'F' : 'C'}</p>
                <p>Low: {Math.round(day.main.temp_min)}°{units === 'imperial' ? 'F' : 'C'}</p>
                <p>High: {Math.round(day.main.temp_max)}°{units === 'imperial' ? 'F' : 'C'}</p>
                <p>Weather: {capitalizeDescription(day.weather[0].description)}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading forecast data...</p>
      )}
    </div>
  );
}

export default App;