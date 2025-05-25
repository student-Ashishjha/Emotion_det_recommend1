import React, { useState } from 'react'
import { Github, Twitter, Mail, Youtube, Facebook, Instagram, Phone, Users, X } from 'lucide-react'

export default function Footer({ darkMode = false }) {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [hoveredNav, setHoveredNav] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  // New footer color: teal to orange gradient
const footerStyle = {
  marginTop: '0',
  padding: '0',
  background: 'linear-gradient(200deg, #a17ee6 0%, #6a44e0 90%)',
  color: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  position: 'relative'
};


  const mainSectionStyle = {
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  }

  // Brand title: simple text, no box, no gradient
  const brandTitleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#222222',
    marginBottom: '8px',
    textAlign: 'center'
  }

  const brandSubtitleStyle = {
    fontSize: '14px',
    color: 'rgba(34, 34, 34, 0.8)',
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: '15px'
  }

  const socialContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }

  // Social icons: subtle hover scale, no background box
  const getSocialIconStyle = (linkType) => ({
    cursor: 'pointer',
    transition: 'transform 0.3s',
    transform: hoveredLink === linkType ? 'translateY(-3px) scale(1.2)' : 'none'
  })

  const navigationStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }

  const getNavItemStyle = (navItem) => ({
    color: hoveredNav === navItem ? '#1de9b6' : '#222222',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px 16px',
    borderRadius: '20px',
    background: hoveredNav === navItem ? 'rgba(29, 233, 182, 0.13)' : 'transparent'
  })

  const copyrightSectionStyle = {
    padding: '15px 20px',
    borderTop: '1px solid rgba(34, 34, 34, 0.08)',
    background: 'rgba(2, 183, 77, 0.09)',
    textAlign: 'center'
  }

  const copyrightTextStyle = {
    fontSize: '12px',
    color: 'rgba(34, 34, 34, 0.6)',
    fontWeight: '400'
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(3, 3, 34, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  }

  const modalContentStyle = {
    background: 'linear-gradient(135deg, #fffde4 0%, #1de9b6 100%)',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative',
    color: '#000'
  }

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(29, 233, 182, 0.13)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#222'
  }

  const modalTitleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '20px',
    textAlign: 'center'
  }

  const contactItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    background: 'rgba(29, 233, 182, 0.09)',
    borderRadius: '12px',
    marginBottom: '12px'
  }

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'About', action: 'about' },
    { name: 'Contact', action: 'contact' },
    { name: 'Team', action: 'team' }
  ]

  const socialLinks = [
    { name: 'facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'github', icon: Github, href: 'https://github.com' },
    { name: 'youtube', icon: Youtube, href: 'https://youtube.com' }
  ]

  const teamMembers = [
    { name: 'Abhilash kr', role: 'Lead AI Architect' },
    { name: 'Ambrin RK', role: 'Machine Learning Engineer' },
    { name: 'Ashish JHA', role: 'AI Research Scientist' },
    { name: 'Sai Sanjana', role: 'Data Science Lead' }
  ]

  const handleNavClick = (item) => {
    if (item.action) {
      setActiveModal(item.action)
    } else if (item.href) {
      window.open(item.href, '_blank')
    }
  }

  const handleSocialClick = (href) => {
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const renderModal = () => {
    if (!activeModal) return null

    return (
      <div style={modalOverlayStyle} onClick={closeModal}>
        <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
          <button style={closeButtonStyle} onClick={closeModal}>
            <X size={16} />
          </button>
          {activeModal === 'team' && (
            <>
              <h2 style={modalTitleStyle}>Our Team</h2>
              {teamMembers.map((member, index) => (
                <div key={index} style={contactItemStyle}>
                  <Users size={20} color="#1de9b6" />
                  <div>
                    <div style={{ fontWeight: '600' }}>{member.name}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>{member.role}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          {activeModal === 'about' && (
            <>
              <h2 style={modalTitleStyle}>About EMOTION AI</h2>
              <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
                We are passionate CSE (AI) Engineers dedicated to revolutionizing the world through artificial intelligence.
              </p>
              <p style={{ lineHeight: '1.6' }}>
                Our mission is to inspire humanity with groundbreaking creativity, innovation, and transformative AI solutions that reshape the future.
              </p>
            </>
          )}
          {activeModal === 'contact' && (
            <>
              <h2 style={modalTitleStyle}>Contact Us</h2>
              <div style={contactItemStyle}>
                <Phone size={20} color="#1de9b6" />
                <div>
                  <div style={{ fontWeight: '600' }}>Phone</div>
                  <div>8217087871</div>
                </div>
              </div>
              <div style={contactItemStyle}>
                <Mail size={20} color="#ffb74d" />
                <div>
                  <div style={{ fontWeight: '600' }}>Email</div>
                  <div>jhaashishkumar5432@gmail.com</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <footer style={footerStyle}>
        <div style={mainSectionStyle}>
          {/* Brand Section */}
          <div>
            <h1 style={brandTitleStyle}>EMOTION AI</h1>
            <p style={brandSubtitleStyle}>Inspiring the World Through AI</p>
          </div>

          {/* Social Icons */}
          <div style={socialContainerStyle}>
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <span
                  key={social.name}
                  style={getSocialIconStyle(social.name)}
                  onMouseEnter={() => setHoveredLink(social.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => handleSocialClick(social.href)}
                >
                  <IconComponent size={22} color="#222222" />
                </span>
              )
            })}
          </div>

          {/* Navigation */}
          <nav style={navigationStyle}>
            {navItems.map((item) => (
              <div
                key={item.name}
                style={getNavItemStyle(item.name)}
                onMouseEnter={() => setHoveredNav(item.name)}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => handleNavClick(item)}
              >
                {item.name}
              </div>
            ))}
          </nav>
        </div>

        {/* Copyright Section */}
        <div style={copyrightSectionStyle}>
          <p style={copyrightTextStyle}>
            © {new Date().getFullYear()} EMOTION AI • All rights reserved
          </p>
        </div>
      </footer>

      {/* Modal */}
      {renderModal()}
    </>
  )
}
