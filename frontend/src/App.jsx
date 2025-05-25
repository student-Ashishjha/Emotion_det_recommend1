import React, { useState, useRef, useEffect } from 'react'
import BackendFaceDetection from './BackendFaceDetection'
import FaceDetection from './FaceDetection'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadType, setUploadType] = useState('image') // 'image' or 'video'
  const [emotionResult, setEmotionResult] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [wsMessages, setWsMessages] = useState([])
  const ws = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [capturing, setCapturing] = useState(false)

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setEmotionResult(null)
    setUploadMessage('')
  }

  // Upload file to backend
  const handleUpload = async () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      let uploadUrl = ''
      if (uploadType === 'image') {
        uploadUrl = '/upload/image'
      } else if (uploadType === 'video') {
        uploadUrl = '/upload/video'
      }
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadResponse.json()
      setUploadMessage(uploadData.message || 'Upload completed.')

      if (uploadType === 'image') {
        // After image upload, call detect_emotion
        const detectResponse = await fetch('/detect_emotion', {
          method: 'POST',
          body: formData,
        })
        const detectData = await detectResponse.json()
        setEmotionResult(detectData)
      }
    } catch (error) {
      setUploadMessage('Upload failed: ' + error.message)
    }
  }

  // WebSocket setup for real-time capture
  useEffect(() => {
    if (capturing) {
      ws.current = new WebSocket('ws://127.0.0.1:8000/ws/capture')
      ws.current.onopen = () => {
        console.log('WebSocket connected')
      }
      ws.current.onmessage = (event) => {
        setWsMessages((prev) => [...prev, event.data])
      }
      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
      }
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      return () => {
        ws.current.close()
      }
    }
  }, [capturing])

  // Start webcam capture
  const startCapture = () => {
    setCapturing(true)
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    })
  }

  // Stop webcam capture
  const stopCapture = () => {
    setCapturing(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Capture frame and send to websocket
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !ws.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    const dataUrl = canvasRef.current.toDataURL('image/jpeg')
    ws.current.send(dataUrl)
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Emotion Detector</h1>

      <div>
        <label>
          <input
            type="radio"
            value="image"
            checked={uploadType === 'image'}
            onChange={() => {
              setUploadType('image')
              setEmotionResult(null)
              setUploadMessage('')
            }}
          />
          Upload Image
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value="video"
            checked={uploadType === 'video'}
            onChange={() => {
              setUploadType('video')
              setEmotionResult(null)
              setUploadMessage('')
            }}
          />
          Upload Video
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <input type="file" accept={uploadType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: 10 }}>
          Upload
        </button>
      </div>

      {uploadMessage && <p>{uploadMessage}</p>}

      {emotionResult && uploadType === 'image' && (
        <div>
          <h3>Detected Emotion:</h3>
          {emotionResult.faces && emotionResult.faces.length > 0 ? (
            emotionResult.faces.map((face, index) => (
              <p key={index}>
                Emotion: {face.emotion} <br />
                Confidence: {(face.confidence * 100).toFixed(2)}%
              </p>
            ))
          ) : (
            <p>No faces detected</p>
          )}
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      <div>
        <h2>Real-time Capture</h2>
        {!capturing ? (
          <button onClick={() => setCapturing(true)}>Start Capture</button>
        ) : (
          <button onClick={() => setCapturing(false)}>Stop Capture</button>
        )}
        {capturing && <BackendFaceDetection />}
      </div>
    </div>
  )
}

export default App
