import React from 'react';
import styled from '@emotion/styled';
import { useModifyStore } from '../../store/modifyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaRuler, FaObjectUngroup, FaTimes, FaArrowsAltH } from 'react-icons/fa';

const ToolbarContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 100px;
  left: 16px;
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

  svg {
    font-size: 16px;
  }
`;

export function ModifyToolbar() {
  const mode = useModifyStore(state => state.mode);
  const setMode = useModifyStore(state => state.setMode);
  const clearSelection = useModifyStore(state => state.clearSelection);
  const theme = useSettingsStore(state => state.theme);

  const handleModeChange = (newMode: 'measure' | 'align') => {
    if (mode === newMode) {
      setMode('none');
      clearSelection();
    } else {
      setMode(newMode);
      clearSelection();
    }
  };

  return (
    <ToolbarContainer $theme={theme}>
      <ToolButton
        onClick={() => handleModeChange('measure')}
        $active={mode === 'measure'}
        $theme={theme}
        title="Measure distance between faces (M)"
      >
        <FaRuler />
        Measure
      </ToolButton>
      
      <ToolButton
        onClick={() => handleModeChange('align')}
        $active={mode === 'align'}
        $theme={theme}
        title="Align faces (A)"
      >
        <FaArrowsAltH />
        Align
      </ToolButton>

      {mode !== 'none' && (
        <ToolButton
          onClick={() => {
            setMode('none');
            clearSelection();
          }}
          $theme={theme}
          title="Exit modify mode (Esc)"
        >
          <FaTimes />
          Exit
        </ToolButton>
      )}
    </ToolbarContainer>
  );
}
