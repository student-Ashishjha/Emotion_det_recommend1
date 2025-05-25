import React, { useState } from 'react'
import Header from './components/Header'
import SettingsPanel from './components/SettingsPanel'
import TabNavigation from './components/TabNavigation'
import UploadTab from './components/UploadTab'
import RealTimeTab from './components/RealTimeTab'
import HistoryTab from './components/HistoryTab'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadType, setUploadType] = useState('image')
  const [emotionResult, setEmotionResult] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [detectionHistory, setDetectionHistory] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [confidence, setConfidence] = useState(0.5)
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode 
        ? '#111827' 
        : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      color: darkMode ? '#f9fafb' : '#111827',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} showSettings={showSettings} setShowSettings={setShowSettings} />
        {showSettings && <SettingsPanel darkMode={darkMode} confidence={confidence} setConfidence={setConfidence} />}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
        {activeTab === 'upload' && (
          <UploadTab
            darkMode={darkMode}
            uploadType={uploadType}
            setUploadType={setUploadType}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            emotionResult={emotionResult}
            setEmotionResult={setEmotionResult}
            uploadMessage={uploadMessage}
            setUploadMessage={setUploadMessage}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            detectionHistory={detectionHistory}
            setDetectionHistory={setDetectionHistory}
            confidence={confidence}
          />
        )}
        {activeTab === 'realtime' && (
          <RealTimeTab
            darkMode={darkMode}
            confidence={confidence}
            emotionResult={emotionResult}
            setEmotionResult={setEmotionResult}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            darkMode={darkMode}
            detectionHistory={detectionHistory}
            clearHistory={() => setDetectionHistory([])}
          />
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        button:active {
          transform: translateY(0);
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default App
