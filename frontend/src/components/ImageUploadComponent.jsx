import { useState } from 'react';

function ImageUploadComponent({ onImageSelect, isUploading, previewUrl }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(previewUrl || null);
  const [error, setError] = useState('');

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setError('');

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WEBP are allowed.');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    if (onImageSelect) {
      onImageSelect(file);
    }
  }

  function handleRemove() {
    setSelectedFile(null);
    setPreview(null);
    setError('');
  }

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Upload Image</h3>

      {preview ? (
        <div className="mb-4">
          <div className="mb-3 overflow-hidden rounded-lg">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-full object-cover"
            />
          </div>
          <div className="mb-3 text-sm text-slate-600">
            {selectedFile && (
              <>
                <p>
                  <strong>File:</strong> {selectedFile.name}
                </p>
                <p>
                  <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 hover:border-slate-400">
            <svg
              className="mb-2 h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-slate-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</span>
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isUploading && (
        <p className="text-sm text-blue-600">Uploading image...</p>
      )}
    </div>
  );
}

export default ImageUploadComponent;
