import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { FaEye, FaEyeSlash, FaChevronRight } from 'react-icons/fa';

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
  gap: 8px;
`;

const Item = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.isSelected ? '#e3f2fd' : 'transparent'};
  cursor: pointer;
  &:hover {
    background: ${props => props.isSelected ? '#e3f2fd' : '#f5f5f5'};
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

  const { objects, selectedObjectId, setSelectedObject, updateObject, removeObject, duplicateObject } = useSceneStore();

  const handleContextMenu = (e: React.MouseEvent, objectId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      objectId
    });
  };

  const handleClickOutside = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleVisibility = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      updateObject(objectId, { visible: !object.visible });
    }
  };

  return (
    <Container>
      <Header>Model Structure</Header>
      <ItemList>
        {objects.map(object => (
          <Item
            key={object.id}
            isSelected={selectedObjectId === object.id}
            onClick={() => setSelectedObject(object.id)}
            onContextMenu={(e) => handleContextMenu(e, object.id)}
          >
            <FaChevronRight />
            <ItemName>{object.name}</ItemName>
            <VisibilityButton onClick={(e) => toggleVisibility(e, object.id)}>
              {object.visible ? <FaEye /> : <FaEyeSlash />}
            </VisibilityButton>
          </Item>
        ))}
      </ItemList>

      {contextMenu.visible && contextMenu.objectId && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y}>
          <MenuItem onClick={() => {
            const object = objects.find(obj => obj.id === contextMenu.objectId);
            if (object) {
              const newName = prompt('Enter new name:', object.name);
              if (newName) {
                updateObject(contextMenu.objectId, { name: newName });
              }
            }
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}>Rename</MenuItem>
          <MenuItem onClick={() => {
            duplicateObject(contextMenu.objectId!);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}>Duplicate</MenuItem>
          <MenuItem onClick={() => {
            removeObject(contextMenu.objectId!);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }}>Delete</MenuItem>
        </ContextMenu>
      )}
    </Container>
  );
} 