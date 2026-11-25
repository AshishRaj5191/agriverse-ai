const https = require('https');
const axios = require('axios');
const ApiError = require('../utils/ApiError');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const WTTR_URL = 'https://wttr.in';

const ipv4Agent = new https.Agent({ family: 4 });
const HTTP_HEADERS = {
  'User-Agent': 'AgriVerse-AI/1.0',
  Accept: 'application/json',
};

function mapWwoToWmoCode(wwoCode) {
  const code = Number(wwoCode);
  if (code === 113) return 0; // Clear
  if (code === 116) return 2; // Partly cloudy
  if (code === 119 || code === 122) return 3; // Overcast
  if ([143, 248, 260].includes(code)) return 45; // Fog
  if ([176, 263, 266, 293, 296, 353].includes(code)) return 61; // Light rain
  if ([299, 302, 305, 308, 356, 359].includes(code)) return 63; // Rain
  if ([200, 386, 389, 392, 395].includes(code)) return 95; // Thunderstorm
  return 2;
}

async function fetchFromOpenMeteo(locationName) {
  const locationResponse = await axios.get(GEOCODING_URL, {
    params: {
      name: locationName,
      count: 1,
      language: 'en',
      format: 'json',
    },
    timeout: 10000,
    httpsAgent: ipv4Agent,
    headers: HTTP_HEADERS,
  });

  const locations = locationResponse.data?.results || [];

  if (locations.length === 0) {
    throw new ApiError(404, `Weather location not found for "${locationName}".`);
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
    httpsAgent: ipv4Agent,
    headers: HTTP_HEADERS,
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
      temperature: weather.current?.temperature_2m ?? null,
      humidity: weather.current?.relative_humidity_2m ?? null,
      precipitation: weather.current?.precipitation ?? null,
      windSpeed: weather.current?.wind_speed_10m ?? null,
      weatherCode: weather.current?.weather_code ?? null,
    },
    daily: {
      time: weather.daily?.time || [],
      weatherCode: weather.daily?.weather_code || [],
      temperatureMax: weather.daily?.temperature_2m_max || [],
      temperatureMin: weather.daily?.temperature_2m_min || [],
      precipitation: weather.daily?.precipitation_sum || [],
      precipitationProbability:
        weather.daily?.precipitation_probability_max || [],
    },
    source: 'Open-Meteo',
  };
}

async function fetchFromWttr(locationName) {
  const response = await axios.get(
    `${WTTR_URL}/${encodeURIComponent(locationName)}`,
    {
      params: { format: 'j1' },
      timeout: 10000,
      httpsAgent: ipv4Agent,
      headers: HTTP_HEADERS,
    }
  );

  const data = response.data;
  const current = data?.current_condition?.[0];
  const area = data?.nearest_area?.[0];
  const days = data?.weather || [];

  if (!current) {
    throw new Error('Invalid fallback weather payload');
  }

  return {
    location: {
      name: area?.areaName?.[0]?.value || locationName,
      country: area?.country?.[0]?.value || '',
      state: area?.region?.[0]?.value || null,
      latitude: area?.latitude ? Number(area.latitude) : null,
      longitude: area?.longitude ? Number(area.longitude) : null,
      timezone: 'auto',
    },
    current: {
      time: current.localObsDateTime || new Date().toISOString(),
      temperature: Number(current.temp_C),
      humidity: Number(current.humidity),
      precipitation: Number(current.precipMM || 0),
      windSpeed: Number(current.windspeedKmph || 0),
      weatherCode: mapWwoToWmoCode(current.weatherCode),
    },
    daily: {
      time: days.map((d) => d.date),
      weatherCode: days.map((d) =>
        mapWwoToWmoCode(d.hourly?.[4]?.weatherCode || d.hourly?.[0]?.weatherCode)
      ),
      temperatureMax: days.map((d) => Number(d.maxtempC)),
      temperatureMin: days.map((d) => Number(d.mintempC)),
      precipitation: days.map((d) =>
        Number(
          (d.hourly || [])
            .reduce((sum, h) => sum + Number(h.precipMM || 0), 0)
            .toFixed(1)
        )
      ),
      precipitationProbability: days.map((d) =>
        Math.max(0, ...(d.hourly || []).map((h) => Number(h.chanceofrain || 0)))
      ),
    },
    source: 'wttr.in',
  };
}

async function getWeatherByCity(city) {
  const locationName = String(city || '').trim();

  if (!locationName) {
    throw new ApiError(400, 'City or location is required.');
  }

  try {
    return await fetchFromOpenMeteo(locationName);
  } catch (openMeteoError) {
    if (openMeteoError instanceof ApiError) {
      throw openMeteoError;
    }

    console.error(
      '[Weather] Open-Meteo failed:',
      openMeteoError.code || openMeteoError.response?.status,
      openMeteoError.message
    );

    try {
      return await fetchFromWttr(locationName);
    } catch (fallbackError) {
      console.error(
        '[Weather] Fallback failed:',
        fallbackError.code || fallbackError.response?.status,
        fallbackError.message
      );

      if (openMeteoError.response || fallbackError.response) {
        throw new ApiError(502, 'Weather provider is currently unavailable.');
      }

      throw new ApiError(502, 'Unable to fetch weather information.');
    }
  }
}

module.exports = {
  getWeatherByCity,
};