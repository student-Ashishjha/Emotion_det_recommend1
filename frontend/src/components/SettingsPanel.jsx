import React from 'react'

export default function SettingsPanel({ darkMode, confidence, setConfidence }) {
  const cardStyle = {
    background: darkMode 
      ? 'rgba(31, 41, 55, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid #374151' : '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px'
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>
        Detection Settings
      </h3>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Confidence Threshold: {(confidence * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#8b5cf6' }}
        />
      </div>
    </div>
  )
}
