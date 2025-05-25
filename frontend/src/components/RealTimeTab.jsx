import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Square } from 'lucide-react'

export default function RealTimeTab({ darkMode, confidence, emotionResult, setEmotionResult }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const ws = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [smoothedResults, setSmoothedResults] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
  const previousResults = useRef([])

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

  const getEmotionColor = useCallback((emotion) => {
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
  }, [])

  // Smoothing function to reduce jitter
  const smoothResults = useCallback((newResult) => {
    if (!newResult || !newResult.faces) return newResult

    // Keep only last 3 results for smoothing
    previousResults.current.push(newResult)
    if (previousResults.current.length > 3) {
      previousResults.current.shift()
    }

    // If we don't have enough history, return current result
    if (previousResults.current.length < 2) return newResult

    // Average the bounding box coordinates to reduce jitter
    const smoothedFaces = newResult.faces.map((currentFace, index) => {
      const relevantResults = previousResults.current.filter(result => 
        result.faces && result.faces[index]
      )

      if (relevantResults.length < 2) return currentFace

      // Calculate average position
      const avgX = relevantResults.reduce((sum, result) => sum + result.faces[index].x, 0) / relevantResults.length
      const avgY = relevantResults.reduce((sum, result) => sum + result.faces[index].y, 0) / relevantResults.length
      const avgWidth = relevantResults.reduce((sum, result) => sum + result.faces[index].width, 0) / relevantResults.length
      const avgHeight = relevantResults.reduce((sum, result) => sum + result.faces[index].height, 0) / relevantResults.length

      return {
        ...currentFace,
        x: Math.round(avgX),
        y: Math.round(avgY),
        width: Math.round(avgWidth),
        height: Math.round(avgHeight)
      }
    })

    return { ...newResult, faces: smoothedFaces }
  }, [])

  // Draw function with proper scaling and boundaries
  const drawDetections = useCallback(() => {
    if (!overlayCanvasRef.current || !videoRef.current || !smoothedResults) return

    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get video dimensions and scale factors
    const videoRect = video.getBoundingClientRect()
    const scaleX = canvas.width / video.videoWidth
    const scaleY = canvas.height / video.videoHeight

    if (!smoothedResults.faces || smoothedResults.faces.length === 0) return

    smoothedResults.faces.forEach((face, index) => {
      // Only draw if confidence is above threshold
      if (face.confidence < confidence) return

      // Scale coordinates to canvas size
      const x = face.x * scaleX
      const y = face.y * scaleY
      const width = face.width * scaleX
      const height = face.height * scaleY

      const color = getEmotionColor(face.emotion)

      // Draw rectangle with shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Draw label background
      ctx.font = 'bold 16px Arial'
      const text = `${face.emotion} ${(face.confidence * 100).toFixed(0)}%`
      const textMetrics = ctx.measureText(text)
      const textWidth = textMetrics.width
      const textHeight = 20

      // Position label above the rectangle, or below if not enough space
      const labelY = y > textHeight + 5 ? y - 5 : y + height + textHeight

      // Draw label background with rounded corners effect
      ctx.fillStyle = color
      ctx.fillRect(x, labelY - textHeight, textWidth + 12, textHeight + 4)

      // Draw label text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, x + 6, labelY - 4)

      // Draw confidence indicator (small circle)
      ctx.beginPath()
      ctx.arc(x + width - 10, y + 10, 6, 0, 2 * Math.PI)
      ctx.fillStyle = face.confidence > 0.8 ? '#10b981' : face.confidence > 0.6 ? '#f59e0b' : '#ef4444'
      ctx.fill()
    })
  }, [smoothedResults, confidence, getEmotionColor])

  // Handle WebSocket messages with smoothing
  useEffect(() => {
    if (capturing) {
      ws.current = new WebSocket('ws://127.0.0.1:8000/ws/capture')
      
      ws.current.onopen = () => {
        console.log('WebSocket connected')
        previousResults.current = [] // Reset smoothing buffer
      }
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Apply smoothing to reduce jitter
          const smoothed = smoothResults(data)
          setSmoothedResults(smoothed)
          setEmotionResult(smoothed)
        } catch (e) {
          console.error('Failed to parse websocket message', e)
        }
      }
      
      ws.current.onclose = () => console.log('WebSocket disconnected')
      ws.current.onerror = (error) => console.error('WebSocket error:', error)
      
      return () => {
        if (ws.current) ws.current.close()
      }
    }
  }, [capturing, setEmotionResult, smoothResults])

  // Draw detections when results change
  useEffect(() => {
    if (videoReady) {
      drawDetections()
    }
  }, [smoothedResults, videoReady, drawDetections])

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user' // Use front camera
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCapturing(true)
        setVideoReady(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCapture = () => {
    setCapturing(false)
    setVideoReady(false)
    setSmoothedResults(null)
    previousResults.current = []
    
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    if (ws.current) {
      ws.current.close()
    }
  }

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !ws.current || 
        ws.current.readyState !== WebSocket.OPEN || !videoReady) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Ensure video has loaded
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    // Draw current frame to hidden canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64 with better quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    ws.current.send(dataUrl)
  }, [videoReady])

  // Capture frames at intervals
  useEffect(() => {
    if (capturing && videoReady) {
      // Reduce frequency to decrease server load and improve stability
      const interval = setInterval(captureFrame, 300) // 3 times per second
      return () => clearInterval(interval)
    }
  }, [capturing, videoReady, captureFrame])

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Real-time Detection</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!capturing ? (
            <button onClick={startCapture} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Play size={16} />
              <span>Start Camera</span>
            </button>
          ) : (
            <button onClick={stopCapture} style={{ ...buttonPrimary, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <Square size={16} />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
          <video
            ref={videoRef}
            style={{ 
              width: '100%', 
              height: 'auto',
              borderRadius: '12px', 
              background: '#000',
              display: 'block'
            }}
            autoPlay
            muted
            playsInline
          />
          
          {/* Hidden canvas for frame capture */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ display: 'none' }}
          />
          
          {/* Overlay canvas for drawing detections */}
          <canvas
            ref={overlayCanvasRef}
            width={640}
            height={480}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              borderRadius: '12px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live results display */}
          {smoothedResults && smoothedResults.faces && smoothedResults.faces.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', margin: '0 0 12px 0' }}>
                Live Detection Results
              </h3>
              {smoothedResults.faces.map((face, index) => (
                <div key={index} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: darkMode ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb',
                  marginBottom: '8px',
                  border: `2px solid ${getEmotionColor(face.emotion)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontWeight: '600', 
                      fontSize: '16px',
                      color: getEmotionColor(face.emotion),
                      textTransform: 'capitalize'
                    }}>
                      {face.emotion}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      background: face.confidence > 0.8 ? '#10b981' : face.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {(face.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {capturing && (!smoothedResults || !smoothedResults.faces || smoothedResults.faces.length === 0) && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280',
              background: darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.5)',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Looking for faces...
                <br />
                <small>Make sure you're well-lit and facing the camera</small>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}