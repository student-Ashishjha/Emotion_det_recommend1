import React, { useState, useEffect } from "react";
import { Upload, Camera, History } from "lucide-react";

export default function TabNavigation({ activeTab = "upload", setActiveTab = () => {}, darkMode = false }) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const tabs = [
    { 
      id: "upload", 
      label: "Upload & Analyze", 
      icon: Upload, 
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(102, 126, 234, 0.4)"
    },
    { 
      id: "realtime", 
      label: "Real-time Detection", 
      icon: Camera, 
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: "rgba(240, 147, 251, 0.4)"
    },
    { 
      id: "history", 
      label: "History", 
      icon: History, 
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      shadowColor: "rgba(79, 172, 254, 0.4)"
    }
  ];

  const createRipple = (e, tabId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
      tabId
    };
    
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleTabClick = (tabId, e) => {
    createRipple(e, tabId);
    setActiveTab(tabId);
  };

  const getTabStyle = (tab) => {
    const isActive = activeTab === tab.id;
    const isHovered = hoveredTab === tab.id;

    return {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px 24px",
      margin: "0 8px",
      background: isActive 
        ? tab.gradient
        : darkMode
        ? isHovered 
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.05)"
        : isHovered
        ? "rgba(0, 0, 0, 0.08)"
        : "rgba(255, 255, 255, 0.9)",
      color: isActive 
        ? "#ffffff" 
        : darkMode 
        ? "#e2e8f0" 
        : "#1a202c",
      borderRadius: "20px",
      border: isActive 
        ? "none"
        : darkMode
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: isActive ? "700" : "500",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isActive 
        ? "translateY(-4px) scale(1.05)" 
        : isHovered 
        ? "translateY(-2px) scale(1.02)" 
        : "translateY(0) scale(1)",
      boxShadow: isActive
        ? `0 20px 40px ${tab.shadowColor}, 0 8px 16px rgba(0, 0, 0, 0.1)`
        : isHovered
        ? darkMode
          ? "0 12px 24px rgba(0, 0, 0, 0.3)"
          : "0 8px 16px rgba(0, 0, 0, 0.08)"
        : "0 4px 8px rgba(0, 0, 0, 0.05)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      outline: "none",
      userSelect: "none"
    };
  };

  const getIconStyle = (tab) => {
    const isActive = activeTab === tab.id;
    const isHovered = hoveredTab === tab.id;

    return {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isActive 
        ? "rotate(360deg) scale(1.1)" 
        : isHovered 
        ? "scale(1.1)" 
        : "scale(1)",
      filter: isActive 
        ? "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" 
        : "none"
    };
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0px",
    marginBottom: "32px",
    padding: "20px",
    position: "relative"
  };

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, 
      ${darkMode 
        ? 'rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.03)' 
        : 'rgba(139, 92, 246, 0.02), rgba(236, 72, 153, 0.015)'
      }, transparent 70%)`,
    pointerEvents: "none",
    transition: "all 0.3s ease"
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      style={containerStyle}
      onMouseMove={handleMouseMove}
      role="tablist"
      aria-label="Navigation tabs"
    >
      <div style={backgroundStyle} />
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={(e) => handleTabClick(tab.id, e)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            style={getTabStyle(tab)}
            role="tab"
            aria-selected={isActive}
            aria-label={`Switch to ${tab.label}`}
          >
            {/* Ripple effects */}
            {ripples
              .filter(ripple => ripple.tabId === tab.id)
              .map(ripple => (
                <div
                  key={ripple.id}
                  style={{
                    position: "absolute",
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.3)",
                    transform: "scale(0)",
                    animation: "rippleEffect 0.6s ease-out forwards",
                    pointerEvents: "none"
                  }}
                />
              ))}

            {/* Floating orb for active tab */}
            {isActive && (
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: "16px",
                height: "16px",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                animation: "float 2s ease-in-out infinite",
                boxShadow: "0 4px 12px rgba(255, 255, 255, 0.5)"
              }} />
            )}

            <Icon size={20} style={getIconStyle(tab)} />
            <span style={{
              fontWeight: isActive ? "700" : "500",
              letterSpacing: "0.02em",
              transition: "all 0.3s ease"
            }}>
              {tab.label}
            </span>

            {/* Active indicator line */}
            {isActive && (
              <div style={{
                position: "absolute",
                bottom: "-2px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "3px",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "2px",
                animation: "slideIn 0.3s ease-out"
              }} />
            )}
          </button>
        );
      })}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes rippleEffect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes slideIn {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            width: 60%;
            opacity: 1;
          }
        }
        
        button:focus-visible {
          outline: 2px solid rgba(139, 92, 246, 0.6);
          outline-offset: 4px;
        }
        
        @media (hover: hover) {
          button:hover {
            transform: translateY(-2px) scale(1.02) !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        `
      }} />
    </div>
  );
}