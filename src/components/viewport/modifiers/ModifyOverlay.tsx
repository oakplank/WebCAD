import React from 'react';
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

  // Handle alignment when both faces are selected
  React.useEffect(() => {
    if (mode === 'align' && selectedFace1 && selectedFace2) {
      // Find source object
      const sourceObject = objects.find(obj => obj.id === selectedFace1.objectId);
      
      if (sourceObject) {
        // Calculate translation vector
        const translation = new THREE.Vector3().subVectors(
          selectedFace2.center,
          selectedFace1.center
        );

        // Update object position
        const newPosition = [
          sourceObject.position[0] + translation.x,
          sourceObject.position[1] + translation.y,
          sourceObject.position[2] + translation.z
        ] as [number, number, number];

        // Update position and save state
        updateObject(sourceObject.id, { position: newPosition });
        useSceneStore.getState().saveState();
      }

      // Reset modify state
      useModifyStore.getState().reset();
    }
  }, [selectedFace2]); // Only trigger on second face selection

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
          'Select first face (Press F to cycle through faces)'
        ) : !selectedFace2 ? (
          'Select second face (Press F to cycle through faces)'
        ) : mode === 'align' ? (
          'Aligning faces...'
        ) : (
          'Measurement complete'
        )}
      </Instructions>
    </OverlayContainer>
  );
}
