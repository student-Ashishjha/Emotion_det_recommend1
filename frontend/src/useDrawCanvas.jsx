import { useEffect, useRef } from 'react'

function useDrawCanvas(emotionResult, confidenceThreshold, canvasRef, imageRef, getEmotionColor) {
  const animationFrameRef = useRef()

  useEffect(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Early return if refs are not ready
    if (!canvasRef?.current || !imageRef?.current) return

    const canvas = canvasRef.current
    const imageElement = imageRef.current
    const ctx = canvas.getContext('2d')

    // Function to draw on canvas
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Early return if no emotion results
      if (!emotionResult || !emotionResult.faces || emotionResult.faces.length === 0) {
        return
      }

      // Calculate scale factors
      let scaleX = 1
      let scaleY = 1

      // For image elements
      if (imageElement.tagName === 'IMG') {
        scaleX = canvas.width / imageElement.naturalWidth
        scaleY = canvas.height / imageElement.naturalHeight
      }
      // For video elements
      else if (imageElement.tagName === 'VIDEO') {
        if (imageElement.videoWidth && imageElement.videoHeight) {
          scaleX = canvas.width / imageElement.videoWidth
          scaleY = canvas.height / imageElement.videoHeight
        }
      }

      // Draw each detected face
      emotionResult.faces.forEach((face, index) => {
        // Skip if confidence is below threshold
        if (face.confidence < (confidenceThreshold || 0.5)) return

        // Get face coordinates - handle different data structures
        let x, y, width, height
        
        if (face.boundingBox) {
          // Structure: { boundingBox: { x, y, width, height } }
          x = face.boundingBox.x * scaleX
          y = face.boundingBox.y * scaleY
          width = face.boundingBox.width * scaleX
          height = face.boundingBox.height * scaleY
        } else if (face.x !== undefined) {
          // Structure: { x, y, width, height }
          x = face.x * scaleX
          y = face.y * scaleY
          width = face.width * scaleX
          height = face.height * scaleY
        } else {
          // Skip if no valid coordinates
          return
        }

        const color = getEmotionColor(face.emotion)

        // Set drawing styles
        ctx.lineWidth = 3
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.font = 'bold 16px Arial'
        ctx.textBaseline = 'top'

        // Draw rectangle with shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        // Draw the face rectangle
        ctx.strokeRect(x, y, width, height)

        // Reset shadow for text
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Prepare label text
        const emotion = face.emotion || 'unknown'
        const confidence = face.confidence || 0
        const text = `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} (${(confidence * 100).toFixed(0)}%)`
        
        // Measure text dimensions
        const textMetrics = ctx.measureText(text)
        const textWidth = textMetrics.width
        const textHeight = 20

        // Calculate label position (above the rectangle, or below if not enough space)
        const labelX = x
        const labelY = y > textHeight + 10 ? y - textHeight - 5 : y + height + 5

        // Draw label background with padding
        const padding = 6
        ctx.fillStyle = color
        ctx.fillRect(labelX - padding/2, labelY - padding/2, textWidth + padding, textHeight + padding)

        // Draw label text
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.fillText(text, labelX, labelY + 2)

        // Draw confidence indicator dot
        const dotX = x + width - 12
        const dotY = y + 12
        const dotRadius = 6

        ctx.beginPath()
        ctx.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI)
        
        // Color code confidence levels
        if (confidence >= 0.8) {
          ctx.fillStyle = '#10b981' // Green for high confidence
        } else if (confidence >= 0.6) {
          ctx.fillStyle = '#f59e0b' // Yellow for medium confidence
        } else {
          ctx.fillStyle = '#ef4444' // Red for low confidence
        }
        
        ctx.fill()

        // Add white border to confidence dot
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Use requestAnimationFrame for smooth drawing
    animationFrameRef.current = requestAnimationFrame(draw)

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [emotionResult, confidenceThreshold, canvasRef, imageRef, getEmotionColor])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}

export default useDrawCanvas