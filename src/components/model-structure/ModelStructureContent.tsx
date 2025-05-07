import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaEye, FaEyeSlash, FaChevronRight, FaChevronDown, FaCopy, FaTrash, FaPen, FaObjectGroup, FaObjectUngroup, FaLayerGroup, FaDraftingCompass, FaPencilRuler, FaCube, FaCircle, FaCubes } from 'react-icons/fa';
import { SceneObject } from '../../types/scene.types';

const Container = styled.div<{ $theme: 'light' | 'dark' }>`
  padding: 16px;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

const Header = styled.div<{ $theme: 'light' | 'dark' }>`
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.$theme === 'dark' ? '#404040' : '#eee'};
  margin-bottom: 16px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Item = styled.div<{ isSelected: boolean; depth?: number; $theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  padding: 8px;
  padding-left: ${props => (props.depth || 0) * 20 + 8}px;
  border-radius: 4px;
  background: ${props => props.isSelected 
    ? props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd'
    : 'transparent'};
  cursor: pointer;
  user-select: none;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  &:hover {
    background: ${props => props.isSelected 
      ? props.$theme === 'dark' ? '#0d47a1' : '#e3f2fd'
      : props.$theme === 'dark' ? '#3d3d3d' : '#f5f5f5'};
  }
`;

const IconButton = styled.button<{ $theme: 'light' | 'dark' }>`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${props => props.$theme === 'dark' ? '#b0b0b0' : '#666666'};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  }
`;

const ContextMenu = styled.div<{ $theme: 'light' | 'dark' }>`
  position: fixed;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 160px;
`;

const MenuItem = styled.div<{ $theme: 'light' | 'dark'; $danger?: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$danger ? '#ff4444' : 'inherit'};
  &:hover {
    background: ${props => props.$theme === 'dark' ? '#3d3d3d' : '#f5f5f5'};
  }
`;

const Divider = styled.div<{ $theme: 'light' | 'dark' }>`
  height: 1px;
  background: ${props => props.$theme === 'dark' ? '#404040' : '#eee'};
  margin: 4px 0;
`;

const RenameInput = styled.input<{ $theme: 'light' | 'dark' }>`
  background: ${props => props.$theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  border: 1px solid ${props => props.$theme === 'dark' ? '#404040' : '#ddd'};
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
  padding: 4px 8px;
  border-radius: 4px;
  width: calc(100% - 16px);
  margin: 4px 8px;
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

// Utility to get children of an object
const getChildren = (objects: SceneObject[], parentId: string | null) =>
  objects.filter(obj => obj.parentId === parentId);

// Utility to get icon by type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'workplane': return <FaDraftingCompass style={{ color: '#1976d2' }} />;
    case 'sketch': return <FaPencilRuler style={{ color: '#ff9900' }} />;
    case 'group': return <FaObjectGroup style={{ color: '#8e24aa' }} />;
    case 'cube': return <FaCube style={{ color: '#607d8b' }} />;
    case 'sphere': return <FaCircle style={{ color: '#607d8b' }} />;
    case 'cylinder': return <FaCubes style={{ color: '#607d8b' }} />;
    default: return <FaLayerGroup style={{ color: '#888' }} />;
  }
};

// (Optional) Active workplane/sketch highlighting (future-proof)
const activeWorkplaneId = null; // Replace with store value if/when added
const activeSketchId = null; // Replace with store value if/when added

export function ModelStructureContent() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    objectId: string;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const objects = useSceneStore(state => state.objects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const updateObject = useSceneStore(state => state.updateObject);
  const removeObject = useSceneStore(state => state.removeObject);
  const duplicateObject = useSceneStore(state => state.duplicateObject);
  const groupObjects = useSceneStore(state => state.groupObjects);
  const ungroupObjects = useSceneStore(state => state.ungroupObjects);
  const mergeObjects = useSceneStore(state => state.mergeObjects);
  const theme = useSettingsStore(state => state.theme);
  const setActiveSketchId = useSceneStore(state => state.setActiveSketchId);

  const toggleExpanded = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  }, [expandedGroups]);

  const toggleVisibility = useCallback((e: React.MouseEvent, object: SceneObject) => {
    e.stopPropagation();
    updateObject(object.id, { visible: !object.visible });
  }, [updateObject]);

  const handleSelect = useCallback((e: React.MouseEvent, object: SceneObject) => {
    if (e.ctrlKey || e.metaKey) {
      if (selectedObjectIds.includes(object.id)) {
        setSelectedObjects(selectedObjectIds.filter(id => id !== object.id));
      } else {
        setSelectedObjects([...selectedObjectIds, object.id]);
      }
    } else {
      setSelectedObjects([object.id]);
    }
    // Set active sketch if a sketch is selected, otherwise clear
    if (object.type === 'sketch') {
      setActiveSketchId?.(object.id);
    } else {
      setActiveSketchId?.(null);
    }
  }, [selectedObjectIds, setSelectedObjects, setActiveSketchId]);

  const handleContextMenu = useCallback((e: React.MouseEvent, object: SceneObject) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedObjectIds.includes(object.id)) {
      setSelectedObjects([object.id]);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      objectId: object.id
    });
  }, [selectedObjectIds, setSelectedObjects]);

  const handleRename = useCallback((objectId: string) => {
    setRenamingId(objectId);
    setContextMenu(null);
  }, []);

  const handleRenameSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && renamingId) {
      const newName = e.currentTarget.value.trim();
      if (newName) {
        updateObject(renamingId, { name: newName });
      }
      setRenamingId(null);
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  }, [renamingId, updateObject]);

  const handleDuplicate = useCallback(() => {
    if (contextMenu) {
      duplicateObject(contextMenu.objectId);
      setContextMenu(null);
    }
  }, [contextMenu, duplicateObject]);

  const handleDelete = useCallback(() => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => removeObject(id));
      setSelectedObjects([]);
    }
    setContextMenu(null);
  }, [selectedObjectIds, removeObject, setSelectedObjects]);

  const handleGroupSelected = useCallback(() => {
    if (selectedObjectIds.length > 1) {
      groupObjects(selectedObjectIds);
    }
    setContextMenu(null);
  }, [selectedObjectIds, groupObjects]);

  const handleUngroup = useCallback(() => {
    if (contextMenu) {
      ungroupObjects(contextMenu.objectId);
      setContextMenu(null);
    }
  }, [contextMenu, ungroupObjects]);

  const handleMergeSelected = useCallback(() => {
    if (selectedObjectIds.length > 1) {
      mergeObjects(selectedObjectIds);
    }
    setContextMenu(null);
  }, [selectedObjectIds, mergeObjects]);

  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setRenamingId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Recursive render function
  const renderObjectTree = (
    objects: SceneObject[],
    parentId: string | null = null,
    depth: number = 0
  ) => {
    return getChildren(objects, parentId).map(object => {
      const isSelected = selectedObjectIds.includes(object.id);
      const isExpanded = expandedGroups.has(object.id);
      const isRenaming = renamingId === object.id;
      const hasChildren = getChildren(objects, object.id).length > 0;
      const isActive = object.id === activeWorkplaneId || object.id === activeSketchId;
      return (
        <React.Fragment key={object.id}>
          <Item
            isSelected={isSelected || isActive}
            depth={depth}
            onClick={(e) => handleSelect(e, object)}
            onContextMenu={(e) => handleContextMenu(e, object)}
            $theme={theme}
          >
            {hasChildren && (
              <IconButton 
                onClick={(e) => toggleExpanded(e, object.id)} 
                $theme={theme}
              >
                {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </IconButton>
            )}
            <IconButton $theme={theme} style={{ pointerEvents: 'none' }}>
              {getTypeIcon(object.type)}
            </IconButton>
            <IconButton 
              onClick={(e) => toggleVisibility(e, object)} 
              $theme={theme}
            >
              {object.visible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
            </IconButton>
            {isRenaming ? (
              <RenameInput
                autoFocus
                defaultValue={object.name}
                onKeyDown={handleRenameSubmit}
                onClick={(e) => e.stopPropagation()}
                $theme={theme}
              />
            ) : (
              <span style={{ marginLeft: 8, fontWeight: isActive ? 700 : 400 }}>
                {object.name}
              </span>
            )}
          </Item>
          {hasChildren && isExpanded && (
            <ItemList>
              {renderObjectTree(objects, object.id, depth + 1)}
            </ItemList>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Container $theme={theme}>
      <Header $theme={theme}>Model Structure</Header>
      <ItemList>
        {renderObjectTree(objects, null, 0)}
      </ItemList>

      {contextMenu && (
        <ContextMenu
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
          $theme={theme}
        >
          <MenuItem onClick={() => handleRename(contextMenu.objectId)} $theme={theme}>
            <FaPen size={12} /> Rename
          </MenuItem>
          <MenuItem onClick={handleDuplicate} $theme={theme}>
            <FaCopy size={12} /> Duplicate
          </MenuItem>
          {selectedObjectIds.length > 1 && (
            <>
              <MenuItem onClick={handleGroupSelected} $theme={theme}>
                <FaObjectGroup size={12} /> Group
              </MenuItem>
              <MenuItem onClick={handleMergeSelected} $theme={theme}>
                <FaLayerGroup size={12} /> Merge
              </MenuItem>
            </>
          )}
          {objects.find(obj => obj.id === contextMenu.objectId)?.type === 'group' && (
            <MenuItem onClick={handleUngroup} $theme={theme}>
              <FaObjectUngroup size={12} /> Ungroup
            </MenuItem>
          )}
          <Divider $theme={theme} />
          <MenuItem onClick={handleDelete} $theme={theme} $danger>
            <FaTrash size={12} /> Delete
          </MenuItem>
        </ContextMenu>
      )}
    </Container>
  );
}
