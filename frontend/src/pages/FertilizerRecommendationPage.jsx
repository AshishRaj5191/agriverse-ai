import { useState } from 'react'
import { recommendFertilizer } from '../services/api'

const crops = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Mustard',
  'Groundnut',
  'Potato',
  'Tomato',
]

function FertilizerRecommendationPage() {
  const [crop, setCrop] = useState('Wheat')
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setRecommendation(null)

    try {
      const response = await recommendFertilizer({ crop })
      setRecommendation(response?.data || null)
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to generate fertilizer recommendation. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Smart Farming
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Fertilizer Recommendation
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Select a crop to receive fertilizer and nutrient guidance based on
          the AgriVerse recommendation rules.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Select Crop
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="crop"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Crop
              </label>

              <select
                id="crop"
                name="crop"
                value={crop}
                onChange={(event) => setCrop(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {crops.map((cropName) => (
                  <option key={cropName} value={cropName}>
                    {cropName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Generating Recommendation...'
                : 'Get Fertilizer Recommendation'}
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
            Fertilizer Guidance
          </h2>

          {!recommendation && !loading && !error && (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-500">
              Select a crop and click the button to generate fertilizer
              guidance.
            </div>
          )}

          {recommendation && (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-700">
                  Selected Crop
                </p>

                <h3 className="mt-1 text-2xl font-bold text-emerald-900">
                  {recommendation.crop}
                </h3>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Primary Fertilizer
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {recommendation.recommendation?.primary}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Key Nutrients
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendation.recommendation?.nutrients?.map((nutrient) => (
                    <span
                      key={nutrient}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
                    >
                      {nutrient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Application Guidance
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {recommendation.recommendation?.guidance}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {recommendation?.disclaimer && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <strong>Important:</strong> {recommendation.disclaimer}
        </div>
      )}
    </div>
  )
}

export default FertilizerRecommendationPage