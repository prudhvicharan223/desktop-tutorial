'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileCode, AlertCircle, CheckCircle2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const ACCEPTED = '.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.go,.rs,.rb,.php,.html,.css,.scss,.json,.md,.yaml,.yml,.sh,.bash,.sql,.kt,.swift,.cs,.r,.m,.lua,.dart,.vue,.svelte'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({ onClose }) {
  const { uploadFile } = useAppStore()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5 MB.')
      return
    }
    setSelectedFile(file)
    setError(null)
    setSuccess(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError(null)
    try {
      await uploadFile(selectedFile)
      setSuccess(true)
      setTimeout(() => onClose?.(), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-omni-text flex items-center gap-1.5">
          <Upload size={14} className="text-omni-accent" />
          Upload Code File
        </span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-omni-muted hover:text-omni-text transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-omni-border hover:border-omni-accent/50 rounded-lg p-4 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFile ? (
          <div className="flex items-center justify-center gap-2 text-sm text-omni-text">
            <FileCode size={16} className="text-omni-accent" />
            <span>{selectedFile.name}</span>
            <span className="text-omni-muted">({formatBytes(selectedFile.size)})</span>
          </div>
        ) : (
          <p className="text-xs text-omni-muted">
            Drop a file here or <span className="text-omni-accent">browse</span><br />
            Max 5 MB · JS, TS, PY, JAVA, GO, RS and more
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-omni-error">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs text-omni-success">
          <CheckCircle2 size={13} /> File uploaded and loaded into editor!
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-omni-accent text-omni-bg hover:bg-omni-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading…' : 'Upload & Analyze'}
      </button>
    </div>
  )
}
