import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import * as THREE from 'three';
import { useSceneStore } from '../../../store/sceneStore';
import { useModifyStore } from '../../../store/modifyStore';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

const MeasurementDisplay = styled.div`
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
`;

const Instructions = styled.div`
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
`;

export function ModifyOverlay() {
  const mode = useModifyStore(state => state.mode);
  const selectedFace1 = useModifyStore(state => state.selectedFace1);
  const selectedFace2 = useModifyStore(state => state.selectedFace2);
  const measurementResult = useModifyStore(state => state.measurementResult);
  const updateObject = useSceneStore(state => state.updateObject);
  const objects = useSceneStore(state => state.objects);

  useEffect(() => {
    if (mode === 'align' && selectedFace1 && selectedFace2) {
      // Check if faces are parallel
      const angle = selectedFace1.normal.angleTo(selectedFace2.normal);
      const isParallel = Math.abs(angle) < 0.1 || Math.abs(Math.PI - angle) < 0.1;

      if (!isParallel) {
        alert('Faces must be parallel for alignment');
        useModifyStore.getState().reset();
        return;
      }

      // Find the source object (the one we'll move)
      const sourceObject = objects.find(obj => obj.id === selectedFace1.objectId);
      if (!sourceObject) return;

      // Calculate translation to align faces
      const translation = new THREE.Vector3().subVectors(selectedFace2.center, selectedFace1.center);
      
      // Project translation onto the normal direction
      const normalizedNormal = selectedFace2.normal.clone().normalize();
      const projectedTranslation = normalizedNormal.multiplyScalar(translation.dot(normalizedNormal));

      // Apply translation
      const newPosition = new THREE.Vector3(...sourceObject.position).add(projectedTranslation);

      updateObject(sourceObject.id, {
        position: [newPosition.x, newPosition.y, newPosition.z]
      });

      // Reset the modify state
      useModifyStore.getState().reset();
    }
  }, [mode, selectedFace1, selectedFace2, updateObject, objects]);

  if (mode === 'none') return null;

  return (
    <OverlayContainer>
      {mode === 'measure' && measurementResult !== null && (
        <MeasurementDisplay>
          Distance: {measurementResult.toFixed(2)} units
        </MeasurementDisplay>
      )}

      <Instructions>
        {!selectedFace1 ? (
          <>Hover over an object and press F to cycle through faces. Click to select.</>
        ) : !selectedFace2 ? (
          <>Select second face (Press F to cycle through faces)</>
        ) : mode === 'align' ? (
          'Aligning faces...'
        ) : (
          'Measurement complete'
        )}
      </Instructions>
    </OverlayContainer>
  );
}