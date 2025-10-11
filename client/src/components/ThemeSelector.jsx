import React, { useState, useRef, useEffect } from 'react';
import '../ThemeSelector.css';

const themes = [
  { id: "theme1", name: "Warm", colors: ["#FFF5E4", "#FFE3E1", "#FFD1D1", "#FF9494"] },
  { id: "theme2", name: "Dark Ocean", colors: ["#222831", "#393E46", "#00ADB5", "#EEEEEE"] },
  { id: "theme3", name: "Neon", colors: ["#08D9D6", "#252A34", "#FF2E63", "#EAEAEA"] },
  { id: "theme4", name: "Pastel", colors: ["#FFB6B9", "#FAE3D9", "#BBDED6", "#61C0BF"] }
];

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // بستن منو با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector-container" ref={menuRef}>
      <button 
        className={`theme-menu-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle theme menu"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 5V3M12 21V19M16.95 7.05L18.36 5.64M5.64 18.36L7.05 16.95M19 12H21M3 12H5M16.95 16.95L18.36 18.36M5.64 5.64L7.05 7.05" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"/>
        </svg>
      </button>

      <div className={`theme-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="dropdown-header">
          <span>Select Theme</span>
        </div>
        <div className="theme-options">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="theme-preview">
                {theme.colors.map((color, i) => (
                  <span 
                    key={i} 
                    className="color-dot" 
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24">
                  <path 
                    fill="currentColor" 
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;