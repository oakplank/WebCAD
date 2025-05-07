import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useModifyStore } from '../../store/modifyStore';
import { FaCube, FaCircle, FaBorderAll, FaSquare, FaUndo, FaRedo, FaRuler, FaArrowsAltH, FaDraftingCompass, FaPencilRuler } from 'react-icons/fa';
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
  const mode = useModifyStore(state => state.mode);
  const reset = useModifyStore(state => state.reset);
  const createWorkplane = useSceneStore(state => state.createWorkplane);
  const objects = useSceneStore(state => state.objects);
  const updateObject = useSceneStore(state => state.updateObject);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);

  const handleModeChange = (newMode: 'measure' | 'align') => {
    if (mode === newMode) {
      reset();
    } else {
      useModifyStore.getState().setMode(newMode);
      useModifyStore.getState().clearSelection();
    }
  };

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

  // --- Workplane & Sketch Logic ---
  const handleCreateWorkplane = () => {
    const name = window.prompt('Enter workplane name:', 'Workplane');
    if (!name) return;
    createWorkplane({ name });
  };

  const handleCreateSketch = () => {
    // Find all workplanes
    const workplanes = objects.filter(obj => obj.type === 'workplane');
    if (workplanes.length === 0) {
      alert('No workplanes exist. Please create a workplane first.');
      return;
    }
    let workplaneId = workplanes[0].id;
    if (workplanes.length > 1) {
      const name = window.prompt('Enter workplane name to sketch on:\n' + workplanes.map(wp => wp.name).join(', '), workplanes[0].name);
      const found = workplanes.find(wp => wp.name === name);
      if (found) workplaneId = found.id;
      else return;
    }
    // Create a sketch object as a child of the selected workplane
    const sketchName = window.prompt('Enter sketch name:', 'Sketch');
    if (!sketchName) return;
    const sketch = {
      id: crypto.randomUUID(),
      name: sketchName,
      workplaneId,
      entities: [],
      constraints: [],
      isClosed: false
    };
    // Add sketch as a SceneObject, then set its parentId
    addObject({
      type: 'sketch',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ff9900',
      visible: true,
      sketch
    });
    // Set parentId for the newly created sketch object
    setTimeout(() => {
      const newSketchObj = useSceneStore.getState().objects.find(obj => obj.sketch?.id === sketch.id);
      if (newSketchObj) {
        updateObject(newSketchObj.id, { parentId: workplaneId });
      }
    }, 0);
  };

  // Look At logic
  const lookAtEventRef = useRef<{ trigger: (target: any) => void } | null>(null);
  // Provide a way for the viewport to register a callback
  (window as any).__webcad_lookAtEventRef = lookAtEventRef;
  const handleLookAt = () => {
    if (!selectedObjectIds.length) return;
    const obj = objects.find(o => o.id === selectedObjectIds[0]);
    if (!obj) return;
    if (lookAtEventRef.current) {
      lookAtEventRef.current.trigger(obj);
    } else if ((window as any).__webcad_lookAtEventRef?.current) {
      (window as any).__webcad_lookAtEventRef.current.trigger(obj);
    }
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
        <SectionTitle $theme={theme}>Modify</SectionTitle>
        <ButtonGroup>
          <ToolButton 
            onClick={() => handleModeChange('measure')}
            $theme={theme}
          >
            <FaRuler />
            <span>Measure</span>
          </ToolButton>
          <ToolButton 
            onClick={() => handleModeChange('align')}
            $theme={theme}
          >
            <FaArrowsAltH />
            <span>Align</span>
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
          <ToolButton onClick={handleLookAt} $theme={theme}>
            <FaArrowsAltH />
            <span>Look At</span>
          </ToolButton>
        </ButtonGroup>
      </ToolSection>

      <ToolSection $theme={theme}>
        <SectionTitle $theme={theme}>Workplanes & Sketches</SectionTitle>
        <ButtonGroup>
          <ToolButton onClick={handleCreateWorkplane} $theme={theme}>
            <FaDraftingCompass />
            <span>Create Workplane</span>
          </ToolButton>
          <ToolButton onClick={handleCreateSketch} $theme={theme}>
            <FaPencilRuler />
            <span>Create Sketch</span>
          </ToolButton>
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
