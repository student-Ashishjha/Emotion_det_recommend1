import React, { useRef, useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'

function FaceDetection({ onEmotionDetected }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      setModelsLoaded(true)
    }
    loadModels()
  }, [])

  useEffect(() => {
    if (modelsLoaded) {
      startVideo()
    }
  }, [modelsLoaded])

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => console.error('Error accessing webcam:', err))
  }

  const handleVideoOnPlay = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)

      resizedDetections.forEach((detection) => {
        const { expressions, detection: box } = detection
        const maxEmotion = Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b))
        const emotion = maxEmotion[0]
        const confidence = maxEmotion[1]

        const ctx = canvas.getContext('2d')
        const { x, y, width, height } = box.box
        ctx.font = '16px Arial'
        ctx.fillStyle = 'red'
        ctx.fillText(`${emotion} (${(confidence * 100).toFixed(1)}%)`, x, y - 10)

        if (onEmotionDetected) {
          onEmotionDetected({ emotion, confidence, box: { x, y, width, height } })
        }
      })
    }, 1000)
  }

  return (
    <div style={{ position: 'relative', width: 720, height: 560 }}>
      <video
        ref={videoRef}
        width="720"
        height="560"
        autoPlay
        muted
        onPlay={handleVideoOnPlay}
        style={{ border: '1px solid black' }}
      />
      <canvas ref={canvasRef} width="720" height="560" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </div>
  )
}

export default FaceDetection
