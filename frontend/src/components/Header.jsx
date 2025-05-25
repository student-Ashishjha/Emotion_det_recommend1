import React, { useState, useEffect } from 'react'
import { Moon, Sun, Settings } from 'lucide-react'

export default function UniqueEmotionHeader({
  darkMode = false,
  setDarkMode = () => {},
  showSettings = false,
  setShowSettings = () => {},
}) {
  const [emotionState, setEmotionState] = useState('joy')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate time for flowing effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() * 0.001)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  // Cycle emotions
  useEffect(() => {
    const emotions = ['joy', 'peace', 'energy', 'focus', 'dream']
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % emotions.length
      setEmotionState(emotions[index])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Emotion themes
  const getEmotionTheme = () => {
    const themes = {
      joy: { color: '#ff6b9d', accent: '#feca57', glow: '#ff9ff3' },
      peace: { color: '#74b9ff', accent: '#0984e3', glow: '#81ecec' },
      energy: { color: '#00b894', accent: '#00cec9', glow: '#55a3ff' },
      focus: { color: '#6c5ce7', accent: '#a29bfe', glow: '#fd79a8' },
      dream: { color: '#fd79a8', accent: '#fdcb6e', glow: '#e17055' }
    }
    return themes[emotionState] || themes.joy
  }

  const theme = getEmotionTheme()

  // Unique geometric logo
  const GeometricLogo = () => (
    <div
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        cursor: 'pointer',
        transform: `rotate(${time * 20}deg)`,
        transition: 'transform 0.1s linear',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(${time * 20}deg) scale(1.2)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${time * 20}deg) scale(1)`
      }}
    >
      {/* Main hexagon */}
      <div
        style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          top: '10px',
          left: '10px',
          background: `conic-gradient(from 0deg, ${theme.color}, ${theme.accent}, ${theme.glow}, ${theme.color})`,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          filter: `drop-shadow(0 0 20px ${theme.color}66)`,
        }}
      />
      
      {/* Inner triangle */}
      <div
        style={{
          position: 'absolute',
          width: '30px',
          height: '30px',
          top: '25px',
          left: '25px',
          background: darkMode ? '#1a1a2e' : '#ffffff',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          transform: `rotate(${-time * 40}deg)`,
        }}
      />
      
      {/* Corner dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: theme.glow,
            top: '36px',
            left: '36px',
            transform: `rotate(${angle}deg) translateY(-35px)`,
            boxShadow: `0 0 10px ${theme.glow}`,
            animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )

  return (
    <div
      style={{
        margin: '3rem 0 4rem 0',
        padding: '0 2rem',
        position: 'relative',
        minHeight: '120px',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: rotate(var(--angle)) translateY(-35px) scale(1); }
          50% { opacity: 1; transform: rotate(var(--angle)) translateY(-35px) scale(1.5); }
        }
        @keyframes flow {
          0% { transform: translateX(-100px) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 100px)) rotate(360deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }
      `}</style>

      {/* Floating geometric shapes */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: `linear-gradient(45deg, ${theme.color}33, ${theme.accent}33)`,
            clipPath: i % 2 === 0 
              ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
              : 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            top: `${20 + i * 15}%`,
            left: '-50px',
            animation: `flow ${15 + i * 3}s linear infinite`,
            animationDelay: `${i * 2}s`,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Main content - flowing layout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Left section - Logo and brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            padding: '1rem 0',
          }}
        >
          <GeometricLogo />
          
          <div
            style={{
              position: 'relative',
            }}
          >
            {/* Main title with artistic effect */}
            <h1
              style={{
                margin: 0,
                fontSize: '4rem',
                fontWeight: '900',
                background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.accent} 50%, ${theme.glow} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.05em',
                position: 'relative',
                textShadow: `0 0 40px ${theme.color}44`,
                transform: `skew(-5deg, 0deg)`,
              }}
            >
              FLUX
            </h1>
            
            {/* Subtitle with flowing line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.5rem',
                marginLeft: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${theme.color}, transparent)`,
                  borderRadius: '1px',
                }}
              />
              <span
                style={{
                  fontSize: '1rem',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontWeight: '600',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Emotional Flow
              </span>
            </div>

            {/* Status indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1rem',
                marginLeft: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.color}, ${theme.accent})`,
                  boxShadow: `0 0 15px ${theme.color}88`,
                  animation: 'breathe 3s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: '0.875rem',
                  color: darkMode ? '#cbd5e1' : '#475569',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                Currently in {emotionState}
              </span>
            </div>
          </div>
        </div>

        {/* Right section - Floating controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center',
            padding: '1rem 0',
          }}
        >
          {/* Theme toggle */}
          <div
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${theme.color}22, ${theme.accent}22, ${theme.glow}22, ${theme.color}22)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${theme.color}44`,
              boxShadow: `0 8px 32px ${theme.color}33`,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.15) rotate(180deg)'
              e.target.style.boxShadow = `0 15px 40px ${theme.color}55`
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) rotate(0deg)'
              e.target.style.boxShadow = `0 8px 32px ${theme.color}33`
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '4px',
                borderRadius: '50%',
                background: darkMode 
                  ? 'rgba(26, 26, 46, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)',
              }}
            />
            {darkMode ? (
              <Sun size={24} color={theme.color} style={{ zIndex: 2 }} />
            ) : (
              <Moon size={24} color={theme.color} style={{ zIndex: 2 }} />
            )}
          </div>

          {/* Settings button */}
          <div
            onClick={() => setShowSettings(!showSettings)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: showSettings 
                ? `conic-gradient(from 0deg, ${theme.color}, ${theme.accent}, ${theme.glow}, ${theme.color})`
                : `conic-gradient(from 0deg, ${theme.color}22, ${theme.accent}22, ${theme.glow}22, ${theme.color}22)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              backdropFilter: 'blur(20px)',
              border: showSettings ? `2px solid ${theme.color}` : `2px solid ${theme.color}44`,
              boxShadow: showSettings 
                ? `0 15px 40px ${theme.color}66` 
                : `0 8px 32px ${theme.color}33`,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.15)'
              if (!showSettings) {
                e.target.style.boxShadow = `0 15px 40px ${theme.color}55`
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = showSettings 
                ? `0 15px 40px ${theme.color}66` 
                : `0 8px 32px ${theme.color}33`
            }}
          >
            {!showSettings && (
              <div
                style={{
                  position: 'absolute',
                  inset: '4px',
                  borderRadius: '50%',
                  background: darkMode 
                    ? 'rgba(26, 26, 46, 0.9)' 
                    : 'rgba(255, 255, 255, 0.9)',
                }}
              />
            )}
            <Settings 
              size={24} 
              color={showSettings ? 'white' : theme.color}
              style={{ 
                zIndex: 2,
                transform: showSettings ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s ease',
              }} 
            />
          </div>
        </div>
      </div>

      {/* Background accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${theme.color}66, ${theme.accent}66, ${theme.glow}66, transparent)`,
          opacity: 0.6,
        }}
      />
    </div>
  )
}