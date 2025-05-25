import React from 'react'
import { Eye, Moon, Sun, Settings } from 'lucide-react'

export default function Header({ darkMode, setDarkMode, showSettings, setShowSettings }) {
  const buttonSecondary = {
    background: darkMode ? '#374151' : '#f3f4f6',
    color: darkMode ? '#d1d5db' : '#374151',
    border: 'none',
    borderRadius: '12px',
    padding: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Eye size={24} color="white" />
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          Emotion AI
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={buttonSecondary}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={buttonSecondary}
          aria-label="Toggle settings panel"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
