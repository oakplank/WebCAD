import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaEye, FaEyeSlash, FaChevronRight, FaChevronDown, FaCopy, FaTrash, FaPen, FaObjectGroup, FaObjectUngroup, FaLayerGroup } from 'react-icons/fa';
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
  }, [selectedObjectIds, setSelectedObjects]);

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

  const renderObject = useCallback((object: SceneObject, depth: number = 0) => {
    const isSelected = selectedObjectIds.includes(object.id);
    const hasChildren = object.type === 'group' && object.children.length > 0;
    const isExpanded = expandedGroups.has(object.id);
    const isRenaming = renamingId === object.id;

    return (
      <React.Fragment key={object.id}>
        <Item
          isSelected={isSelected}
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
            object.name
          )}
        </Item>
        {hasChildren && isExpanded && object.children.map(childId => {
          const child = objects.find(obj => obj.id === childId);
          if (child) {
            return renderObject(child, depth + 1);
          }
          return null;
        })}
      </React.Fragment>
    );
  }, [
    selectedObjectIds,
    expandedGroups,
    renamingId,
    theme,
    handleSelect,
    handleContextMenu,
    toggleExpanded,
    toggleVisibility,
    handleRenameSubmit,
    objects
  ]);

  const rootObjects = objects.filter(obj => !obj.parentId);

  return (
    <Container $theme={theme}>
      <Header $theme={theme}>Model Structure</Header>
      <ItemList>
        {rootObjects.map(object => renderObject(object))}
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