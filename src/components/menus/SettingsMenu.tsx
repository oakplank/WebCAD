import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useSettingsStore } from '../../store/settingsStore';
import { FaSun, FaMoon, FaCog } from 'react-icons/fa';

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button<{ $theme: 'light' | 'dark' }>`
  background: none;
  border: none;
  color: white;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean; $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
  min-width: 200px;
`;

const MenuItem = styled.div<{ $theme: 'light' | 'dark' }>`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  &:hover {
    background: ${props => props.$theme === 'dark' ? '#3d3d3d' : '#f0f0f0'};
  }
  font-size: 14px;
`;

const ColorInput = styled.input`
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const RangeInput = styled.input`
  width: 100px;
`;

const Label = styled.span<{ $theme: 'light' | 'dark' }>`
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    theme, 
    setTheme,
    backgroundColor,
    setBackgroundColor,
    showGrid,
    setShowGrid,
    viewDistance,
    setViewDistance
  } = useSettingsStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <MenuContainer onMouseLeave={() => setIsOpen(false)}>
      <MenuButton 
        onMouseEnter={() => setIsOpen(true)}
        $theme={theme}
      >
        <FaCog />
        Settings
      </MenuButton>
      <Dropdown $isOpen={isOpen} $theme={theme}>
        <MenuItem $theme={theme} onClick={toggleTheme}>
          <Label $theme={theme}>Theme</Label>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </MenuItem>
        <MenuItem $theme={theme}>
          <Label $theme={theme}>Background</Label>
          <ColorInput
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </MenuItem>
        <MenuItem $theme={theme}>
          <Label $theme={theme}>Show Grid</Label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
        </MenuItem>
        <MenuItem $theme={theme}>
          <Label $theme={theme}>View Distance</Label>
          <RangeInput
            type="range"
            min="10"
            max="100"
            value={viewDistance}
            onChange={(e) => setViewDistance(Number(e.target.value))}
          />
        </MenuItem>
      </Dropdown>
    </MenuContainer>
  );
}