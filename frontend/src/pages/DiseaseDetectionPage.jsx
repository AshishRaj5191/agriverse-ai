import { useEffect, useState } from 'react'
import { addDiseaseEntry, getFarmRecords, predictDisease } from '../services/api'
import ImageUploadComponent from '../components/ImageUploadComponent'

function DiseaseDetectionPage() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [farmRecords, setFarmRecords] = useState([])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [farmsLoading, setFarmsLoading] = useState(true)

  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchFarmRecords()
  }, [])

  async function fetchFarmRecords() {
    setFarmsLoading(true)

    try {
      const result = await getFarmRecords(0, 100)
      const records = result.data?.records || []

      setFarmRecords(records)

      if (records.length > 0) {
        setSelectedFarmId(records[0]._id)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load farm records.'
      )
    } finally {
      setFarmsLoading(false)
    }
  }

  async function handleImageSelect(file) {
    setPrediction(null)
    setError('')
    setSaveMessage('')

    if (!file) {
      return
    }

    setLoading(true)

    try {
      const result = await predictDisease(file)
      setPrediction(result.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to get AI disease prediction.'
      )
    } finally {
      setLoading(false)
    }
  }

  function formatClassName(value) {
    return value
      ?.replaceAll('___', ' - ')
      ?.replaceAll('_', ' ')
  }

  async function handleSaveToFarmRecord() {
    if (!prediction?.top_prediction || !selectedFarmId) {
      return
    }

    setSaveLoading(true)
    setError('')
    setSaveMessage('')

    try {
      const diseaseName = formatClassName(
        prediction.top_prediction.class
      )

      await addDiseaseEntry(selectedFarmId, {
        disease: diseaseName,
        dateObserved: new Date().toISOString().slice(0, 10),
        treatment: '',
        status: 'suspected',
      })

      setSaveMessage(
        'AI disease result saved successfully to the selected farm record.'
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save AI result to farm record.'
      )
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          AgriVerse AI
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          AI Leaf Disease Scanner
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Upload a clear crop leaf image and AgriVerse AI will analyze it
          for possible plant disease.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Scan a Leaf
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Supported formats: JPG, JPEG, PNG and WEBP. Maximum size: 5 MB.
        </p>

        <div className="mt-5">
          <ImageUploadComponent onImageSelect={handleImageSelect} />
        </div>

        {loading && (
          <div className="mt-5 rounded-xl bg-blue-50 p-4 text-blue-700">
            AI is analyzing the image...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
      </section>

      {prediction?.top_prediction && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            AI Analysis Result
          </h2>

          <div className="mt-5 rounded-xl bg-green-50 p-5">
            <p className="text-sm font-medium text-green-700">
              Possible Disease
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatClassName(prediction.top_prediction.class)}
            </p>

            <p className="mt-3 text-lg font-semibold text-green-700">
              Confidence:{' '}
              {prediction.top_prediction.confidence.toFixed(2)}%
            </p>
          </div>

          {prediction.top_predictions?.length > 1 && (
            <div className="mt-5">
              <h3 className="font-semibold text-slate-800">
                Other Possible Results
              </h3>

              <div className="mt-3 space-y-2">
                {prediction.top_predictions
                  .slice(1)
                  .map((item, index) => (
                    <div
                      key={`${item.class}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm text-slate-700">
                        {formatClassName(item.class)}
                      </span>

                      <span className="text-sm font-semibold text-slate-600">
                        {item.confidence.toFixed(2)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Save to Farm Record
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Save this AI result to a farm's disease history for future
              tracking.
            </p>

            {farmsLoading ? (
              <p className="mt-4 text-sm text-slate-600">
                Loading your farm records...
              </p>
            ) : farmRecords.length === 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No farm records found. Create a farm record first to save
                this AI result.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label
                  htmlFor="farm-record"
                  className="block text-sm font-medium text-slate-700"
                >
                  Select Farm Record
                </label>

                <select
                  id="farm-record"
                  value={selectedFarmId}
                  onChange={(event) =>
                    setSelectedFarmId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {farmRecords.map((record) => (
                    <option key={record._id} value={record._id}>
                      {record.crop}
                      {record.cropVariety
                        ? ` - ${record.cropVariety}`
                        : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSaveToFarmRecord}
                  disabled={saveLoading || !selectedFarmId}
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveLoading
                    ? 'Saving...'
                    : 'Save to Farm Record'}
                </button>

                {saveMessage && (
                  <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
                    {saveMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            AI results are intended as decision-support information.
            Confirm the diagnosis with an agriculture expert before
            applying treatment.
          </div>
        </section>
      )}
    </div>
  )
}

export default DiseaseDetectionPage
