import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaCube, FaCircle, FaBorderAll, FaSquare, FaUndo, FaRedo } from 'react-icons/fa';
import { BiCylinder } from 'react-icons/bi';
import { MdOutlineViewInAr } from 'react-icons/md';
import { ViewMode } from '../../types/scene.types';

const ToolbarContainer = styled.div<{ $theme: 'light' | 'dark' }>`
  width: 100%;
  height: 90px;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  padding: 8px;
  gap: 16px;
  z-index: 15;
`;

const ToolSection = styled.div<{ $theme: 'light' | 'dark' }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  padding: 0 16px;
  border-right: 1px solid ${props => props.$theme === 'dark' ? '#404040' : '#eee'};
`;

const SectionTitle = styled.div<{ $theme: 'light' | 'dark' }>`
  font-size: 12px;
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666'};
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolButton = styled.button<{ $theme: 'light' | 'dark' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  gap: 4px;
  min-width: 60px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};

  &:hover {
    background: ${props => props.$theme === 'dark' ? '#3d3d3d' : '#f0f0f0'};
  }

  svg {
    font-size: 20px;
    color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  }

  span {
    font-size: 11px;
  }
`;

const ViewButton = styled(ToolButton)<{ $active: boolean }>`
  background: ${props => props.$active ? (props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd') : 'transparent'};
  &:hover {
    background: ${props => props.$active ? (props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd') : (props.$theme === 'dark' ? '#3d3d3d' : '#f0f0f0')};
  }
`;

const UndoRedoButton = styled(ToolButton)<{ $disabled: boolean }>`
  opacity: ${props => props.$disabled ? 0.5 : 1};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
`;

export function Toolbar() {
  const addObject = useSceneStore(state => state.addObject);
  const viewMode = useSceneStore(state => state.viewMode);
  const setViewMode = useSceneStore(state => state.setViewMode);
  const undo = useSceneStore(state => state.undo);
  const redo = useSceneStore(state => state.redo);
  const canUndo = useSceneStore(state => state.canUndo());
  const canRedo = useSceneStore(state => state.canRedo());
  const theme = useSettingsStore(state => state.theme);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (canRedo) redo();
        } else {
          e.preventDefault();
          if (canUndo) undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const createObject = (type: 'cube' | 'sphere' | 'cylinder') => {
    addObject({
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      visible: true
    });
  };

  return (
    <ToolbarContainer $theme={theme}>
      <ToolSection $theme={theme}>
        <SectionTitle $theme={theme}>Solid</SectionTitle>
        <ButtonGroup>
          <ToolButton onClick={() => createObject('cube')} $theme={theme}>
            <FaCube />
            <span>Cube</span>
          </ToolButton>
          <ToolButton onClick={() => createObject('sphere')} $theme={theme}>
            <FaCircle />
            <span>Sphere</span>
          </ToolButton>
          <ToolButton onClick={() => createObject('cylinder')} $theme={theme}>
            <BiCylinder />
            <span>Cylinder</span>
          </ToolButton>
        </ButtonGroup>
      </ToolSection>

      <ToolSection $theme={theme}>
        <SectionTitle $theme={theme}>View</SectionTitle>
        <ButtonGroup>
          <ViewButton 
            onClick={() => setViewMode('shaded')}
            $active={viewMode === 'shaded'}
            $theme={theme}
          >
            <MdOutlineViewInAr />
            <span>Shaded</span>
          </ViewButton>
          <ViewButton 
            onClick={() => setViewMode('wireframe')}
            $active={viewMode === 'wireframe'}
            $theme={theme}
          >
            <FaBorderAll />
            <span>Wireframe</span>
          </ViewButton>
          <ViewButton 
            onClick={() => setViewMode('surface')}
            $active={viewMode === 'surface'}
            $theme={theme}
          >
            <FaSquare />
            <span>Surface</span>
          </ViewButton>
        </ButtonGroup>
      </ToolSection>

      <ToolSection $theme={theme}>
        <SectionTitle $theme={theme}>Edit</SectionTitle>
        <ButtonGroup>
          <UndoRedoButton 
            onClick={() => canUndo && undo()}
            $disabled={!canUndo}
            $theme={theme}
            title="Undo (Ctrl+Z)"
          >
            <FaUndo />
            <span>Undo</span>
          </UndoRedoButton>
          <UndoRedoButton 
            onClick={() => canRedo && redo()}
            $disabled={!canRedo}
            $theme={theme}
            title="Redo (Ctrl+Y)"
          >
            <FaRedo />
            <span>Redo</span>
          </UndoRedoButton>
        </ButtonGroup>
      </ToolSection>
    </ToolbarContainer>
  );
}