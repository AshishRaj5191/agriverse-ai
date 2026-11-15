const axios = require('axios');
const ApiError = require('../utils/ApiError');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function getWeatherByCity(city) {
  const locationName = String(city || '').trim();

  if (!locationName) {
    throw new ApiError(400, 'City or location is required.');
  }

  try {
    const locationResponse = await axios.get(GEOCODING_URL, {
      params: {
        name: locationName,
        count: 1,
        language: 'en',
        format: 'json',
      },
      timeout: 10000,
    });

    const locations = locationResponse.data?.results || [];

    if (locations.length === 0) {
      throw new ApiError(
        404,
        `Weather location not found for "${locationName}".`
      );
    }

    const location = locations[0];

    const weatherResponse = await axios.get(FORECAST_URL, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current:
          'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily:
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        forecast_days: 5,
        timezone: 'auto',
      },
      timeout: 10000,
    });

    const weather = weatherResponse.data;

    return {
      location: {
        name: location.name,
        country: location.country,
        state: location.admin1 || null,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      },

      current: {
        time: weather.current?.time || null,
        temperature:
          weather.current?.temperature_2m ?? null,
        humidity:
          weather.current?.relative_humidity_2m ?? null,
        precipitation:
          weather.current?.precipitation ?? null,
        windSpeed:
          weather.current?.wind_speed_10m ?? null,
        weatherCode:
          weather.current?.weather_code ?? null,
      },

      daily: {
        time: weather.daily?.time || [],
        weatherCode: weather.daily?.weather_code || [],
        temperatureMax:
          weather.daily?.temperature_2m_max || [],
        temperatureMin:
          weather.daily?.temperature_2m_min || [],
        precipitation:
          weather.daily?.precipitation_sum || [],
        precipitationProbability:
          weather.daily?.precipitation_probability_max || [],
      },

      source: 'Open-Meteo',
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.response) {
      throw new ApiError(
        502,
        'Weather provider is currently unavailable.'
      );
    }

    throw new ApiError(
      502,
      'Unable to fetch weather information.'
    );
  }
}

module.exports = {
  getWeatherByCity,
};