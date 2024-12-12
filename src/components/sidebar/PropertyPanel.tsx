import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PropertyGroup } from './PropertyGroup';
import { VectorInput } from './VectorInput';
import { ColorInput } from './ColorInput';
import { SceneObject } from '../../types/scene.types';

const Panel = styled.div<{ $theme: 'light' | 'dark' }>`
  height: 100%;
  background: ${props => props.$theme === 'dark' ? '#2d2d2d' : '#ffffff'};
  padding: 16px;
  overflow-y: auto;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

const ObjectName = styled.h2<{ $theme: 'light' | 'dark' }>`
  font-size: 16px;
  margin-bottom: 24px;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#000000'};
`;

export function PropertyPanel() {
  const [scaleProportional, setScaleProportional] = useState(false);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const objects = useSceneStore(state => state.objects);
  const updateObject = useSceneStore(state => state.updateObject);
  const theme = useSettingsStore(state => state.theme);

  if (selectedObjectIds.length !== 1) return null;

  const selectedObject = objects.find(obj => obj.id === selectedObjectIds[0]);
  if (!selectedObject) return null;

  const handleVectorChange = (
    property: keyof Pick<SceneObject, 'position' | 'rotation' | 'scale'>,
    index: number,
    value: string
  ) => {
    const newValue = parseFloat(value) || 0;
    const currentValues = [...selectedObject[property]];

    if (property === 'scale' && scaleProportional) {
      const ratio = newValue / (currentValues[index] || 1);
      currentValues[0] *= ratio;
      currentValues[1] *= ratio;
      currentValues[2] *= ratio;
    } else {
      currentValues[index] = newValue;
    }

    updateObject(selectedObject.id, {
      [property]: currentValues as [number, number, number]
    });
  };

  const handleColorChange = (color: string) => {
    updateObject(selectedObject.id, { color });
  };

  return (
    <Panel $theme={theme}>
      <ObjectName $theme={theme}>{selectedObject.name}</ObjectName>

      <PropertyGroup label="Position">
        <VectorInput
          value={selectedObject.position}
          onChange={(index, value) => handleVectorChange('position', index, value)}
        />
      </PropertyGroup>

      <PropertyGroup label="Rotation">
        <VectorInput
          value={selectedObject.rotation.map(v => Number(v.toFixed(1))) as [number, number, number]}
          onChange={(index, value) => handleVectorChange('rotation', index, value)}
          unit="°"
        />
      </PropertyGroup>

      <PropertyGroup 
        label="Scale" 
        locked={scaleProportional}
        onLockToggle={() => setScaleProportional(!scaleProportional)}
      >
        <VectorInput
          value={selectedObject.scale}
          onChange={(index, value) => handleVectorChange('scale', index, value)}
        />
      </PropertyGroup>

      <PropertyGroup label="Color">
        <ColorInput
          value={selectedObject.color}
          onChange={handleColorChange}
        />
      </PropertyGroup>
    </Panel>
  );
}
