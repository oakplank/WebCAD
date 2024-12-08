import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { FaCube, FaCircle, FaBorderAll, FaSquare, FaUndo, FaRedo } from 'react-icons/fa';
import { BiCylinder } from 'react-icons/bi';
import { MdOutlineViewInAr } from 'react-icons/md';
import { ViewMode } from '../../types/scene.types';

const ToolbarContainer = styled.div`
  width: 100%;
  height: 90px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  padding: 8px;
  gap: 16px;
  z-index: 15;
`;

const ToolSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  padding: 0 16px;
  border-right: 1px solid #eee;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolButton = styled.button`
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

  &:hover {
    background: #f0f0f0;
  }

  svg {
    font-size: 20px;
  }

  span {
    font-size: 11px;
  }
`;

const ViewButton = styled(ToolButton)<{ $active: boolean }>`
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  &:hover {
    background: ${props => props.$active ? '#e3f2fd' : '#f0f0f0'};
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
    <ToolbarContainer>
      <ToolSection>
        <SectionTitle>Solid</SectionTitle>
        <ButtonGroup>
          <ToolButton onClick={() => createObject('cube')}>
            <FaCube />
            <span>Cube</span>
          </ToolButton>
          <ToolButton onClick={() => createObject('sphere')}>
            <FaCircle />
            <span>Sphere</span>
          </ToolButton>
          <ToolButton onClick={() => createObject('cylinder')}>
            <BiCylinder />
            <span>Cylinder</span>
          </ToolButton>
        </ButtonGroup>
      </ToolSection>

      <ToolSection>
        <SectionTitle>Modify</SectionTitle>
        <ButtonGroup>
          {/* We'll add modification tools here later */}
        </ButtonGroup>
      </ToolSection>

      <ToolSection>
        <SectionTitle>View</SectionTitle>
        <ButtonGroup>
          <ViewButton 
            onClick={() => setViewMode('shaded')}
            $active={viewMode === 'shaded'}
          >
            <MdOutlineViewInAr />
            <span>Shaded</span>
          </ViewButton>
          <ViewButton 
            onClick={() => setViewMode('wireframe')}
            $active={viewMode === 'wireframe'}
          >
            <FaBorderAll />
            <span>Wireframe</span>
          </ViewButton>
          <ViewButton 
            onClick={() => setViewMode('surface')}
            $active={viewMode === 'surface'}
          >
            <FaSquare />
            <span>Surface</span>
          </ViewButton>
        </ButtonGroup>
      </ToolSection>

      <ToolSection>
        <SectionTitle>Edit</SectionTitle>
        <ButtonGroup>
          <UndoRedoButton 
            onClick={() => canUndo && undo()}
            $disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <FaUndo />
            <span>Undo</span>
          </UndoRedoButton>
          <UndoRedoButton 
            onClick={() => canRedo && redo()}
            $disabled={!canRedo}
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