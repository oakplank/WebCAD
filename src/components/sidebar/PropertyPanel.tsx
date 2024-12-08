import React from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import { FaTimes } from 'react-icons/fa';

const Panel = styled.div`
  height: 100%;
  background: white;
  padding: 16px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
`;

const VectorInputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const VectorInput = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const AxisLabel = styled.span`
  font-size: 12px;
  color: #999;
  width: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const ColorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorInput = styled.input`
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const ColorValue = styled.span`
  font-size: 12px;
  color: #666;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const DeleteButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  &:hover {
    background: #ff0000;
  }
`;

export function PropertyPanel() {
  const selectedObjectId = useSceneStore(state => state.selectedObjectId);
  const objects = useSceneStore(state => state.objects);
  const updateObject = useSceneStore(state => state.updateObject);
  const removeObject = useSceneStore(state => state.removeObject);
  const setSelectedObject = useSceneStore(state => state.setSelectedObject);

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  if (!selectedObject) return null;

  const handleNumberArrayUpdate = (
    property: keyof Pick<SceneObject, 'position' | 'rotation' | 'scale'>,
    index: number,
    value: string
  ) => {
    const newArray = [...selectedObject[property]];
    newArray[index] = parseFloat(value) || 0;
    updateObject(selectedObject.id, { [property]: newArray as [number, number, number] });
  };

  return (
    <Panel>
      <Header>
        <Label>{selectedObject.name}</Label>
        <CloseButton onClick={() => setSelectedObject(null)}>
          <FaTimes />
        </CloseButton>
      </Header>

      <PropertyGroup>
        <GroupHeader>
          <Label>Position</Label>
        </GroupHeader>
        <VectorInputGroup>
          <VectorInput>
            <AxisLabel>X</AxisLabel>
            <Input
              type="number"
              value={selectedObject.position[0]}
              onChange={(e) => handleNumberArrayUpdate('position', 0, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Y</AxisLabel>
            <Input
              type="number"
              value={selectedObject.position[1]}
              onChange={(e) => handleNumberArrayUpdate('position', 1, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Z</AxisLabel>
            <Input
              type="number"
              value={selectedObject.position[2]}
              onChange={(e) => handleNumberArrayUpdate('position', 2, e.target.value)}
            />
          </VectorInput>
        </VectorInputGroup>
      </PropertyGroup>

      <PropertyGroup>
        <GroupHeader>
          <Label>Rotation</Label>
        </GroupHeader>
        <VectorInputGroup>
          <VectorInput>
            <AxisLabel>X</AxisLabel>
            <Input
              type="number"
              value={selectedObject.rotation[0]}
              onChange={(e) => handleNumberArrayUpdate('rotation', 0, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Y</AxisLabel>
            <Input
              type="number"
              value={selectedObject.rotation[1]}
              onChange={(e) => handleNumberArrayUpdate('rotation', 1, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Z</AxisLabel>
            <Input
              type="number"
              value={selectedObject.rotation[2]}
              onChange={(e) => handleNumberArrayUpdate('rotation', 2, e.target.value)}
            />
          </VectorInput>
        </VectorInputGroup>
      </PropertyGroup>

      <PropertyGroup>
        <GroupHeader>
          <Label>Scale</Label>
        </GroupHeader>
        <VectorInputGroup>
          <VectorInput>
            <AxisLabel>X</AxisLabel>
            <Input
              type="number"
              value={selectedObject.scale[0]}
              onChange={(e) => handleNumberArrayUpdate('scale', 0, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Y</AxisLabel>
            <Input
              type="number"
              value={selectedObject.scale[1]}
              onChange={(e) => handleNumberArrayUpdate('scale', 1, e.target.value)}
            />
          </VectorInput>
          <VectorInput>
            <AxisLabel>Z</AxisLabel>
            <Input
              type="number"
              value={selectedObject.scale[2]}
              onChange={(e) => handleNumberArrayUpdate('scale', 2, e.target.value)}
            />
          </VectorInput>
        </VectorInputGroup>
      </PropertyGroup>

      <PropertyGroup>
        <GroupHeader>
          <Label>Color</Label>
        </GroupHeader>
        <ColorContainer>
          <ColorInput
            type="color"
            value={selectedObject.color}
            onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })}
          />
          <ColorValue>{selectedObject.color.toUpperCase()}</ColorValue>
        </ColorContainer>
      </PropertyGroup>

      <DeleteButton onClick={() => removeObject(selectedObject.id)}>
        Delete Object
      </DeleteButton>
    </Panel>
  );
} 