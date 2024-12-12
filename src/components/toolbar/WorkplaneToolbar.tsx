import React from 'react';
import styled from '@emotion/styled';
import { useWorkplaneStore } from '../../store/workplaneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { WorkplaneType } from '../../types/workplane.types';
import { FaCube, FaEye, FaEyeSlash } from 'react-icons/fa';

const ToolbarContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 100px;
  right: 16px;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 100;
`;

const ToolButton = styled.button<{ $active?: boolean; $theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: ${props => props.$active 
    ? props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd'
    : 'transparent'
  };
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: ${props => props.$active
      ? props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd'
      : props.$theme === 'dark' ? '#3d3d3d' : '#f0f0f0'
    };
  }
`;

const VisibilityButton = styled.button<{ $theme: 'light' | 'dark' }>`
  background: none;
  border: none;
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666666'};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  }
`;

export function WorkplaneToolbar() {
  const theme = useSettingsStore(state => state.theme);
  const {
    workplanes,
    activeWorkplaneId,
    addWorkplane,
    setActiveWorkplane,
    toggleWorkplaneVisibility
  } = useWorkplaneStore();

  const handleAddWorkplane = (type: WorkplaneType) => {
    addWorkplane(type);
  };

  return (
    <ToolbarContainer $theme={theme}>
      <ToolButton
        onClick={() => handleAddWorkplane('XY')}
        $active={workplanes.some(wp => wp.isActive && wp.normal[2] === 1)}
        $theme={theme}
      >
        <FaCube />
        Front
      </ToolButton>
      
      <ToolButton
        onClick={() => handleAddWorkplane('YZ')}
        $active={workplanes.some(wp => wp.isActive && wp.normal[0] === 1)}
        $theme={theme}
      >
        <FaCube />
        Right
      </ToolButton>
      
      <ToolButton
        onClick={() => handleAddWorkplane('XZ')}
        $active={workplanes.some(wp => wp.isActive && wp.normal[1] === 1)}
        $theme={theme}
      >
        <FaCube />
        Top
      </ToolButton>

      {workplanes.map(workplane => (
        <ToolButton
          key={workplane.id}
          onClick={() => setActiveWorkplane(workplane.id)}
          $active={workplane.id === activeWorkplaneId}
          $theme={theme}
        >
          {workplane.name}
          <VisibilityButton
            onClick={(e) => {
              e.stopPropagation();
              toggleWorkplaneVisibility(workplane.id);
            }}
            $theme={theme}
          >
            {workplane.visible ? <FaEye /> : <FaEyeSlash />}
          </VisibilityButton>
        </ToolButton>
      ))}
    </ToolbarContainer>
  );
}
