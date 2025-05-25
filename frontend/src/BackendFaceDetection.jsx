import React, { useRef, useEffect, useState } from 'react'

function BackendFaceDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Start webcam video
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => console.error('Error accessing webcam:', err))

    // Setup WebSocket connection
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/capture')
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.faces && data.faces.length > 0) {
          drawDetections(data.faces)
        } else {
          clearCanvas()
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const drawDetections = (faces) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current
    const displaySize = { width: video.videoWidth, height: video.videoHeight }
    canvas.width = displaySize.width
    canvas.height = displaySize.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 2
    ctx.font = '16px Arial'
    ctx.strokeStyle = 'red'
    ctx.fillStyle = 'red'

    faces.forEach((face) => {
      const { x, y, w, h } = face.box
      if (w > 0 && h > 0) { // Draw only if width and height are positive
        ctx.strokeRect(x, y, w, h)
        ctx.fillText(`${face.emotion} (${(face.confidence * 100).toFixed(1)}%)`, x, y - 10)
      }
    })
  }

  const sendFrame = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 560
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(dataUrl)
    }
  }

  useEffect(() => {
    let intervalId
    if (connected) {
      intervalId = setInterval(() => {
        sendFrame()
      }, 1000) // send frame every 1 second
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [connected])

  return (
    <div style={{ position: 'relative', width: 720, height: 560 }}>
      <video
        ref={videoRef}
        width="720"
        height="560"
        autoPlay
        muted
        style={{ border: '1px solid black' }}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </div>
  )
}

export default BackendFaceDetection
