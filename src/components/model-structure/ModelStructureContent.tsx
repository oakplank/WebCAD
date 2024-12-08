import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { FaEye, FaEyeSlash, FaChevronRight, FaChevronDown, FaObjectGroup, FaObjectUngroup } from 'react-icons/fa';

const Container = styled.div`
  padding: 16px;
`;

const Header = styled.div`
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Item = styled.div<{ isSelected: boolean; depth?: number }>`
  display: flex;
  align-items: center;
  padding: 8px;
  padding-left: ${props => (props.depth || 0) * 20 + 8}px;
  border-radius: 4px;
  background: ${props => props.isSelected ? '#e3f2fd' : 'transparent'};
  cursor: pointer;
  user-select: none;
  &:hover {
    background: ${props => props.isSelected ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  &:hover {
    color: #000;
  }
`;

const VisibilityButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const ItemName = styled.span`
  flex: 1;
  margin-left: 8px;
`;

const ContextMenu = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #f0f0f0;
  }
`;

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  objectId: string | null;
}

export function ModelStructureContent() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    objectId: null
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const { 
    objects, 
    selectedObjectIds = [],
    setSelectedObjects,
    updateObject, 
    removeObject, 
    duplicateObject,
    groupObjects,
    ungroupObjects
  } = useSceneStore();

  // Add click-away handler
  useEffect(() => {
    const handleClickAway = () => {
      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('click', handleClickAway);
    return () => document.removeEventListener('click', handleClickAway);
  }, [contextMenu.visible]);

  const handleClick = (e: React.MouseEvent, objectId: string) => {
    if (e.ctrlKey) {
      // Ctrl+click: Toggle selection
      const newSelection = selectedObjectIds.includes(objectId)
        ? selectedObjectIds.filter(id => id !== objectId)
        : [...selectedObjectIds, objectId];
      setSelectedObjects(newSelection);
      setLastSelectedId(objectId);
    } else if (e.shiftKey && lastSelectedId) {
      // Shift+click: Select range
      const allIds = objects.map(obj => obj.id);
      const startIdx = allIds.indexOf(lastSelectedId);
      const endIdx = allIds.indexOf(objectId);
      const range = allIds.slice(
        Math.min(startIdx, endIdx),
        Math.max(startIdx, endIdx) + 1
      );
      setSelectedObjects(range);
    } else {
      // Normal click: Single select
      setSelectedObjects([objectId]);
      setLastSelectedId(objectId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent immediate click-away
    if (!selectedObjectIds.includes(objectId)) {
      setSelectedObjects([objectId]);
    }
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      objectId
    });
  };

  const toggleExpanded = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleVisibility = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      updateObject(objectId, { visible: !object.visible });
    }
  };

  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.objectId) return null;

    const object = objects.find(obj => obj.id === contextMenu.objectId);
    if (!object) return null;

    return (
      <ContextMenu x={contextMenu.x} y={contextMenu.y}>
        {selectedObjectIds.length > 1 && object.type !== 'group' && (
          <MenuItem onClick={() => {
            groupObjects(selectedObjectIds);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}>
            <FaObjectGroup />
            Group
          </MenuItem>
        )}
        {object.type === 'group' && (
          <MenuItem onClick={() => {
            ungroupObjects(object.id);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}>
            <FaObjectUngroup />
            Ungroup
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          const newName = prompt('Enter new name:', object.name);
          if (newName) {
            updateObject(contextMenu.objectId!, { name: newName });
          }
          setContextMenu(prev => ({ ...prev, visible: false }));
        }}>
          Rename
        </MenuItem>
        <MenuItem onClick={() => {
          duplicateObject(contextMenu.objectId!);
          setContextMenu(prev => ({ ...prev, visible: false }));
        }}>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          removeObject(contextMenu.objectId!);
          setContextMenu(prev => ({ ...prev, visible: false }));
        }}>
          Delete
        </MenuItem>
      </ContextMenu>
    );
  };

  const renderObject = (object: SceneObject, depth: number = 0) => {
    const hasChildren = object.children.length > 0;
    const isExpanded = expandedGroups.has(object.id);

    return (
      <React.Fragment key={object.id}>
        <Item
          isSelected={selectedObjectIds?.includes(object.id) || false}
          depth={depth}
          onClick={(e) => handleClick(e, object.id)}
          onContextMenu={(e) => handleContextMenu(e, object.id)}
        >
          {hasChildren ? (
            <ExpandButton onClick={(e) => toggleExpanded(e, object.id)}>
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </ExpandButton>
          ) : (
            <div style={{ width: '20px' }} /> // Spacer for alignment
          )}
          <ItemName>{object.name}</ItemName>
          <VisibilityButton onClick={(e) => toggleVisibility(e, object.id)}>
            {object.visible ? <FaEye /> : <FaEyeSlash />}
          </VisibilityButton>
        </Item>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {objects
              .filter(child => child.parentId === object.id)
              .map(child => renderObject(child, depth + 1))
            }
          </div>
        )}
      </React.Fragment>
    );
  };

  // Get root level objects (those with no parent)
  const rootObjects = objects.filter(obj => obj.parentId === null);

  return (
    <Container>
      <Header>Model Structure</Header>
      <ItemList>
        {rootObjects.map(object => renderObject(object))}
      </ItemList>
      {renderContextMenu()}
    </Container>
  );
} 