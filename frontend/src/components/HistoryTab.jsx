import React from 'react'

export default function HistoryTab({ darkMode, detectionHistory, clearHistory }) {
  const cardStyle = {
    background: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid #374151' : '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    maxHeight: '600px',
    overflowY: 'auto'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '16px'
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Detection History</h2>
      <button onClick={clearHistory} style={buttonStyle}>Clear History</button>
      {detectionHistory.length === 0 ? (
        <p style={{ color: darkMode ? '#d1d5db' : '#374151' }}>No detection history available.</p>
      ) : (
        detectionHistory.map(item => (
          <div key={item.id} style={{
            marginBottom: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: darkMode ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb'
          }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.fileName}</div>
            <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '8px' }}>{item.timestamp}</div>
            {item.result && item.result.faces?.length > 0 ? (
              item.result.faces.map((face, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{face.emotion}</span>: {(face.confidence * 100).toFixed(1)}%
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: darkMode ? '#9ca3af' : '#6b7280' }}>No faces detected</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
