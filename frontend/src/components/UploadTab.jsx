import React, { useRef, useCallback } from 'react'
import { Upload, Trash2, BarChart3 } from 'lucide-react'
import useDrawCanvas from '../useDrawCanvas'

export default function UploadTab({
  darkMode,
  uploadType,
  setUploadType,
  selectedFile,
  setSelectedFile,
  emotionResult,
  setEmotionResult,
  uploadMessage,
  setUploadMessage,
  isProcessing,
  setIsProcessing,
  detectionHistory,
  setDetectionHistory,
  confidence
}) {
  const fileInputRef = useRef(null)
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    setEmotionResult(null)
    setUploadMessage('')
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }, [setSelectedFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      let uploadUrl = uploadType === 'image' ? 'http://localhost:8000/upload/image' : 'http://localhost:8000/upload/video'
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadResponse.json()
      setUploadMessage(uploadData.message || 'Upload completed.')

      if (uploadType === 'image') {
        const detectResponse = await fetch('http://localhost:8000/detect_emotion', {
          method: 'POST',
          body: formData,
        })
        const detectData = await detectResponse.json()
        setEmotionResult(detectData)

        // Add to history
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          fileName: selectedFile.name,
          result: detectData
        }
        setDetectionHistory(prev => [historyItem, ...prev.slice(0, 9)])
      }
    } catch (error) {
      setUploadMessage('Upload failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearPreview = () => {
    setSelectedFile(null)
    setEmotionResult(null)
    setUploadMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#facc15',
      sad: '#60a5fa',
      angry: '#f87171',
      surprised: '#a78bfa',
      fear: '#9ca3af',
      disgust: '#4ade80',
      neutral: '#d1d5db'
    }
    return colors[emotion?.toLowerCase()] || '#d1d5db'
  }

  const cardStyle = {
    background: darkMode 
      ? 'rgba(31, 41, 55, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid #374151' : '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '16px',
    padding: '24px'
  }

  const buttonPrimary = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }

  const buttonSecondary = {
    background: darkMode ? '#374151' : '#f3f4f6',
    color: darkMode ? '#d1d5db' : '#374151',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }

  const dropZoneStyle = {
    border: `2px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '12px',
    padding: '48px 32px',
    textAlign: 'center',
    cursor: 'pointer',
    background: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)',
    transition: 'all 0.2s ease'
  }

  // Removed useDrawCanvas call since we're not using a canvas in this component

  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr', gap: '24px' }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>
          Upload Media
        </h2>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {['image', 'video'].map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                value={type}
                checked={uploadType === type}
                onChange={() => {
                  setUploadType(type)
                  clearPreview()
                }}
                style={{ accentColor: '#8b5cf6' }}
              />
              <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{type}</span>
            </label>
          ))}
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          style={dropZoneStyle}
        >
          <Upload size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', margin: '0 0 8px 0' }}>
            Drop your {uploadType} here or click to browse
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Supports {uploadType === 'image' ? 'JPG, PNG, WebP' : 'MP4, WebM, AVI'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadType === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {selectedFile && (
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                style={{
                  ...buttonPrimary,
                  opacity: isProcessing ? 0.5 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <BarChart3 size={16} />
                )}
                <span>{isProcessing ? 'Analyzing...' : 'Analyze'}</span>
              </button>
              <button onClick={clearPreview} style={buttonSecondary}>
                <Trash2 size={16} />
              </button>
            </div>
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {selectedFile.name}
            </span>
          </div>
        )}

        {uploadMessage && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: uploadMessage.includes('failed') ? '#fef2f2' : '#f0fdf4',
            color: uploadMessage.includes('failed') ? '#dc2626' : '#16a34a',
            border: uploadMessage.includes('failed') ? '1px solid #fecaca' : '1px solid #bbf7d0'
          }}>
            {uploadMessage}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>
          Preview & Results
        </h2>

        {previewUrl && (
          <div style={{ marginBottom: '24px' }}>
            {uploadType === 'image' ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', height: '256px', objectFit: 'cover', borderRadius: '12px' }}
              />
            ) : (
              <video
                src={previewUrl}
                controls
                style={{ width: '100%', height: '256px', objectFit: 'cover', borderRadius: '12px' }}
              />
            )}
          </div>
        )}

        {emotionResult && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>
              Detection Results
            </h3>
            {emotionResult.faces?.length > 0 ? (
              emotionResult.faces.map((face, index) => (
                <div key={index} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: darkMode ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Face {index + 1}</span>
                    <span style={{ 
                      fontSize: '24px', 
                      color: getEmotionColor(face.emotion),
                      textTransform: 'capitalize'
                    }}>
                      {face.emotion}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        width: `${(face.confidence * 100)}%`,
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    {(face.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0', margin: 0 }}>
                No faces detected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}