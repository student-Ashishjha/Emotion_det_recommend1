import React from 'react';

export default function HistoryTab({ darkMode, detectionHistory, clearHistory }) {
  return (
    <div
      style={{
        background: darkMode ? '#23272f' : '#fff',
        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        maxWidth: 1200,
        margin: '0 auto',
        maxHeight: 500,
        overflowY: 'auto',
      }}
    >
      <h2 style={{
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 16,
        color: darkMode ? '#fff' : '#23272f'
      }}>
        Detection History
      </h2>
      <button
        onClick={clearHistory}
        style={{
          background: darkMode ? '#ef4444' : '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        Clear History
      </button>
      {detectionHistory.length === 0 ? (
        <p style={{ color: darkMode ? '#9ca3af' : '#374151' }}>
          No detection history available.
        </p>
      ) : (
        detectionHistory.map(item => (
          <div
            key={item.id}
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: darkMode ? '#374151' : '#f3f4f6',
            }}
          >
            <div style={{ fontWeight: 500 }}>{item.fileName}</div>
            <div style={{ fontSize: 12, color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: 6 }}>
              {item.timestamp}
            </div>
            {item.result && item.result.faces?.length > 0 ? (
              item.result.faces.map((face, idx) => (
                <div key={idx} style={{ fontSize: 13 }}>
                  {face.emotion}: {(face.confidence * 100).toFixed(1)}%
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: 13 }}>
                No faces detected
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
