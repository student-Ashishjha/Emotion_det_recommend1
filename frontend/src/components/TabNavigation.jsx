import React from 'react'
import { Upload, Camera, History } from 'lucide-react'

export default function TabNavigation({ activeTab, setActiveTab, darkMode }) {
  const tabStyle = (active) => ({
    background: active 
      ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
      : darkMode ? '#374151' : 'rgba(255, 255, 255, 0.7)',
    color: active ? 'white' : darkMode ? '#d1d5db' : '#4b5563',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: active ? '0 4px 20px rgba(139, 92, 246, 0.3)' : 'none'
  })

  const tabs = [
    { id: 'upload', label: 'Upload & Analyze', icon: Upload },
    { id: 'realtime', label: 'Real-time Detection', icon: Camera },
    { id: 'history', label: 'History', icon: History }
  ]

  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          style={tabStyle(activeTab === id)}
          aria-selected={activeTab === id}
          role="tab"
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
