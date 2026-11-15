import { useEffect, useState } from 'react'
import { getWeather } from '../services/api'

function getWeatherIcon(code) {
  if (code === 0) return '☀️'
  if ([1, 2, 3].includes(code)) return '⛅'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️'
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️'
  if ([71, 73, 75, 77].includes(code)) return '🌨️'
  if ([80, 81, 82].includes(code)) return '🌦️'
  if ([85, 86].includes(code)) return '🌨️'
  if ([95, 96, 99].includes(code)) return '⛈️'

  return '🌤️'
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
  )
}

function WeatherPage() {
  const [city, setCity] = useState('Delhi')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadWeather = async (location = city) => {
    setLoading(true)
    setError('')

    try {
      const response = await getWeather(location)
      setWeather(response.data)
    } catch (requestError) {
      setWeather(null)

      const message =
        requestError.response?.data?.message ||
        'Unable to fetch weather information.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather('Delhi')
  }, [])

  const handleSearch = async (event) => {
    event.preventDefault()

    const trimmedCity = city.trim()

    if (!trimmedCity) {
      setError('Please enter a city or location.')
      return
    }

    await loadWeather(trimmedCity)
  }

  const daily = weather?.daily

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">
          AgriVerse AI
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Weather Intelligence
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Check current weather conditions and forecast information to support
          better farming decisions.
        </p>
      </section>

      {/* Location Search */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Farm Location
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter your farm location to view live weather information.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city or farm location"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Check Weather'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {/* Location */}
      {weather && (
        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-sm text-sky-700">
            Weather for
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {weather.location.name}
            {weather.location.state
              ? `, ${weather.location.state}`
              : ''}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {weather.location.country}
          </p>
        </section>
      )}

      {/* Current Weather */}
      {weather && (
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Temperature</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {weather.current.temperature} °C
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current temperature
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Humidity</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {weather.current.humidity} %
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Relative humidity
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Wind Speed</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {weather.current.windSpeed} km/h
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current wind speed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rain</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {weather.current.precipitation} mm
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current precipitation
            </p>
          </div>
        </section>
      )}

      {/* Forecast */}
      {weather && daily && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            5-Day Weather Forecast
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upcoming weather conditions for farming decisions.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {daily.time.map((date, index) => (
              <div
                key={date}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-700">
                  {formatDate(date)}
                </p>

                <p className="mt-3 text-3xl">
                  {getWeatherIcon(daily.weatherCode[index])}
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {daily.temperatureMax[index]}° /{' '}
                  {daily.temperatureMin[index]}°C
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Rain: {daily.precipitationProbability[index] ?? 0}%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Precipitation:{' '}
                  {daily.precipitation[index] ?? 0} mm
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Farming Advisory */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Smart Farming
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Weather-Based Farming Advisory
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Weather-based crop and farm advisories can use temperature,
          rainfall, humidity and forecast information to support farming
          decisions.
        </p>
      </section>

      {/* Data Source */}
      <p className="text-center text-xs text-slate-400">
        Weather data source: Open-Meteo
      </p>
    </div>
  )
}

export default WeatherPage