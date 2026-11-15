import { useState } from 'react'
import { recommendCrops } from '../services/api'

function CropRecommendationPage() {
  const [form, setForm] = useState({
    soilType: 'loam',
    season: 'rabi',
    irrigation: 'medium',
  })

  const [recommendations, setRecommendations] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')
    setRecommendations([])

    try {
      const response = await recommendCrops(form)
      const data = response?.data || {}

      setRecommendations(data.recommendations || [])
      setMessage(data.message || 'Recommendations generated successfully.')
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to generate recommendations. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          AI Agriculture Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Crop Recommendation
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Enter your soil, season and irrigation details to receive
          rule-based crop recommendations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Farm Conditions
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="soilType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Soil Type
              </label>

              <select
                id="soilType"
                name="soilType"
                value={form.soilType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="loam">Loam</option>
                <option value="clay">Clay</option>
                <option value="clay loam">Clay Loam</option>
                <option value="sandy loam">Sandy Loam</option>
                <option value="black">Black Soil</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="season"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Season
              </label>

              <select
                id="season"
                name="season"
                value={form.season}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="zaid">Zaid</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="irrigation"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Irrigation Availability
              </label>

              <select
                id="irrigation"
                name="irrigation"
                value={form.irrigation}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Generating Recommendations...'
                : 'Get Crop Recommendations'}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Recommended Crops
          </h2>

          {message && !error && (
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          )}

          {recommendations.length === 0 && !loading && !error && (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-500">
              Select your farm conditions and click the button to generate
              recommendations.
            </div>
          )}

          <div className="mt-5 space-y-4">
            {recommendations.map((recommendation) => (
              <article
                key={recommendation.crop}
                className="rounded-xl border border-emerald-100 bg-emerald-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-emerald-900">
                    {recommendation.crop}
                  </h3>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Recommended
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {recommendation.reason}
                </p>

                <div className="mt-4 rounded-lg bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fertilizer Guidance
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {recommendation.fertilizer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Important:</strong> These recommendations are decision-support
        information based on the selected farm conditions. Soil testing,
        weather conditions and agriculture expert advice should be considered
        before making cultivation decisions.
      </div>
    </div>
  )
}

export default CropRecommendationPage