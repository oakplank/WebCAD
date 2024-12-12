import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useWorkplaneToolStore } from '../../store/workplaneToolStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaPlus, FaRuler, FaCube, FaDrawPolygon } from 'react-icons/fa';

const ToolbarContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 320px;
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

const Input = styled.input<{ $theme: 'light' | 'dark' }>`
  padding: 4px 8px;
  border: 1px solid ${props => props.$theme === 'dark' ? '#404040' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.$theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

const Label = styled.label<{ $theme: 'light' | 'dark' }>`
  font-size: 12px;
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666666'};
`;

export function WorkplaneCreationToolbar() {
  const theme = useSettingsStore(state => state.theme);
  const {
    isActive,
    creationMethod,
    creationState,
    setActive,
    setCreationMethod,
    updateCreationState
  } = useWorkplaneToolStore();

  const handleMethodSelect = (method: 'face' | 'threePoint' | 'offset') => {
    if (creationMethod === method) {
      setActive(false);
      setCreationMethod(null);
    } else {
      setActive(true);
      setCreationMethod(method);
    }
  };

  return (
    <ToolbarContainer $theme={theme}>
      <ToolButton
        onClick={() => handleMethodSelect('face')}
        $active={creationMethod === 'face'}
        $theme={theme}
      >
        <FaCube />
        From Face
      </ToolButton>

      <ToolButton
        onClick={() => handleMethodSelect('threePoint')}
        $active={creationMethod === 'threePoint'}
        $theme={theme}
      >
        <FaDrawPolygon />
        Three Point
      </ToolButton>

      <ToolButton
        onClick={() => handleMethodSelect('offset')}
        $active={creationMethod === 'offset'}
        $theme={theme}
      >
        <FaRuler />
        Offset Plane
      </ToolButton>

      {creationMethod === 'offset' && (
        <InputGroup>
          <Label $theme={theme}>Offset Distance</Label>
          <Input
            type="number"
            value={creationState.offset}
            onChange={(e) => updateCreationState({ offset: Number(e.target.value) })}
            step="0.1"
            $theme={theme}
          />
          
          <Label $theme={theme}>Angle (degrees)</Label>
          <Input
            type="number"
            value={creationState.angle}
            onChange={(e) => updateCreationState({ angle: Number(e.target.value) })}
            step="15"
            $theme={theme}
          />
        </InputGroup>
      )}
    </ToolbarContainer>
  );
}
