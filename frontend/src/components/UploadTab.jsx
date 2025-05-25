import React, { useRef, useCallback, useState, useEffect } from 'react'
import { Upload, Trash2, BarChart3, BookOpen, Play, Image, Video, Eye, FileText } from 'lucide-react'

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isDragActive, setIsDragActive] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#facc15', sad: '#60a5fa', angry: '#f87171',
      surprised: '#a78bfa', fear: '#9ca3af', disgust: '#4ade80', neutral: '#d1d5db'
    }
    return colors[emotion?.toLowerCase()] || '#d1d5db'
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    setEmotionResult(null)
    setUploadMessage('')
    setShowTutorial(false)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setShowTutorial(false)
    }
  }, [setSelectedFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragActive(false), [])

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      let uploadUrl = uploadType === 'image'
        ? 'http://localhost:8000/upload/image'
        : 'http://localhost:8000/upload/video'
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
    setShowTutorial(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const tutorialSteps = [
    { icon: <Image size={20} />, title: "Choose Media Type", desc: "Select Image or Video mode" },
    { icon: <Upload size={20} />, title: "Upload File", desc: "Drag & drop or click to browse" },
    { icon: <BarChart3 size={20} />, title: "Analyze", desc: "Click analyze to detect emotions" },
    { icon: <Play size={20} />, title: "View Results", desc: "See detected emotions & confidence" }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      padding: isMobile ? '1rem' : '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 800,
          margin: 0,
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #facc15)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Emotion Detection 
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: darkMode ? '#9ca3af' : '#6b7280',
          margin: 0
        }}>
          Upload images or videos to analyze facial expressions and emotions
        </p>
      </header>

      {/* Tutorial Section */}
      {showTutorial && (
        <section style={{
          marginBottom: '3rem',
          padding: isMobile ? '1.5rem' : '2rem',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))'
            : 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(236,72,153,0.05))',
          borderRadius: '1.5rem',
          border: `1px solid ${darkMode ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <BookOpen size={24} color="#8b5cf6" />
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              margin: 0,
              color: darkMode ? '#f3f4f6' : '#111827'
            }}>
              Quick Tutorial
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem'
          }}>
            {tutorialSteps.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: darkMode ? 'rgba(55,65,81,0.3)' : 'rgba(255,255,255,0.8)',
                borderRadius: '1rem',
                border: `1px solid ${darkMode ? 'rgba(75,85,99,0.5)' : 'rgba(229,231,235,0.8)'}`
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {step.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    margin: '0 0 0.25rem 0',
                    color: darkMode ? '#f3f4f6' : '#111827'
                  }}>
                    {idx + 1}. {step.title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    margin: 0
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '2rem' : '3rem'
      }}>
        {/* Upload Section */}
        <section style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(31,41,55,0.8), rgba(55,65,81,0.6))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8))',
          padding: isMobile ? '1.5rem' : '2rem',
          borderRadius: '1.5rem',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: darkMode ? '#f3f4f6' : '#111827'
          }}>
            Upload Media
          </h2>

          {/* Type Selection */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {['image', 'video'].map(type => (
              <button
                key={type}
                onClick={() => {
                  setUploadType(type)
                  clearPreview()
                }}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '1rem',
                  background: uploadType === type
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    : (darkMode ? '#374151' : '#f3f4f6'),
                  color: uploadType === type ? '#fff' : (darkMode ? '#d1d5db' : '#374151'),
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragActive ? '#ec4899' : (darkMode ? '#4b5563' : '#d1d5db')}`,
              borderRadius: '1.25rem',
              padding: isMobile ? '2rem 1rem' : '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive
                ? (darkMode ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.05)')
                : 'transparent',
              transition: 'all 0.3s',
              marginBottom: '1.5rem'
            }}
          >
            <Upload size={48} color={isDragActive ? '#ec4899' : '#9ca3af'} style={{ marginBottom: '1rem' }} />
            <div>
              <p style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: darkMode ? '#f3f4f6' : '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                Drop your {uploadType} here or <span style={{ color: '#8b5cf6', textDecoration: 'underline' }}>browse</span>
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: 0
              }}>
                Supports {uploadType === 'image' ? 'JPG, PNG, WebP' : 'MP4, WebM, AVI'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={uploadType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* File Actions */}
          {selectedFile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isProcessing ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <BarChart3 size={16} />
                  )}
                  {isProcessing ? 'Analyzing...' : 'Analyze'}
                </button>
                <button
                  onClick={clearPreview}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    background: darkMode ? '#374151' : '#f3f4f6',
                    color: darkMode ? '#d1d5db' : '#374151',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <span style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedFile.name}
              </span>
            </div>
          )}

          {/* Upload Message */}
          {uploadMessage && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              background: uploadMessage.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              color: uploadMessage.includes('failed') ? '#ef4444' : '#22c55e',
              border: `1px solid ${uploadMessage.includes('failed') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
              fontWeight: 500
            }}>
              {uploadMessage}
            </div>
          )}
        </section>

        {/* Results Section */}
        <section style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(31,41,55,0.9), rgba(55,65,81,0.7))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.8))',
          padding: isMobile ? '1.5rem' : '2rem',
          borderRadius: '1.5rem',
          border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: darkMode 
              ? 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }} />
          
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: darkMode ? '#f3f4f6' : '#111827',
            position: 'relative',
            zIndex: 1
          }}>
            Preview & Results
          </h2>

          {/* Empty State */}
          {!previewUrl && !emotionResult && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1rem',
              textAlign: 'center',
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(75,85,99,0.2), rgba(107,114,128,0.1))'
                : 'linear-gradient(135deg, rgba(248,250,252,0.5), rgba(241,245,249,0.3))',
              borderRadius: '1.25rem',
              border: `1px dashed ${darkMode ? '#4b5563' : '#cbd5e1'}`,
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                padding: '1rem',
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))'
                  : 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(236,72,153,0.05))',
                borderRadius: '1rem',
                marginBottom: '1.5rem'
              }}>
                <Eye size={32} color={darkMode ? '#9ca3af' : '#6b7280'} />
              </div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: darkMode ? '#d1d5db' : '#475569',
                margin: '0 0 0.5rem 0'
              }}>
                Ready for Analysis
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: darkMode ? '#9ca3af' : '#64748b',
                margin: 0,
                maxWidth: '280px'
              }}>
                Upload an {uploadType} to see preview and emotion detection results here
              </p>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <FileText size={16} color={darkMode ? '#9ca3af' : '#6b7280'} />
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: darkMode ? '#d1d5db' : '#475569'
                }}>
                  Media Preview
                </span>
              </div>
              {uploadType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '1rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#cbd5e1'}`,
                    boxShadow: darkMode 
                      ? '0 4px 12px rgba(0,0,0,0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '1rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#cbd5e1'}`,
                    boxShadow: darkMode 
                      ? '0 4px 12px rgba(0,0,0,0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              )}
            </div>
          )}

          {/* Results */}
          {emotionResult && (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <BarChart3 size={16} color="#8b5cf6" />
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  margin: 0,
                  color: darkMode ? '#f3f4f6' : '#111827'
                }}>
                  Detection Results
                </h3>
              </div>
              {emotionResult.faces?.length > 0 ? (
                emotionResult.faces.map((face, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(75,85,99,0.4), rgba(107,114,128,0.2))'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(248,250,252,0.5))',
                    marginBottom: '1rem',
                    border: `1px solid ${darkMode ? '#4b5563' : '#cbd5e1'}`,
                    boxShadow: darkMode 
                      ? '0 2px 8px rgba(0,0,0,0.2)' 
                      : '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontWeight: 600, color: darkMode ? '#f3f4f6' : '#111827' }}>
                        Face {idx + 1}
                      </span>
                      <span style={{
                        fontSize: '1.1rem',
                        color: getEmotionColor(face.emotion),
                        textTransform: 'capitalize',
                        fontWeight: 700
                      }}>
                        {face.emotion}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: darkMode ? '#374151' : '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        width: `${face.confidence * 100}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      Confidence: {(face.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '2rem',
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(75,85,99,0.2), rgba(107,114,128,0.1))'
                    : 'linear-gradient(135deg, rgba(248,250,252,0.5), rgba(241,245,249,0.3))',
                  borderRadius: '1rem',
                  border: `1px dashed ${darkMode ? '#4b5563' : '#cbd5e1'}`,
                  textAlign: 'center'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: darkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <Eye size={24} color="#ef4444" />
                  </div>
                  <p style={{
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontStyle: 'italic',
                    margin: 0,
                    fontSize: '0.95rem'
                  }}>
                    No faces detected in the uploaded media.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  )
}