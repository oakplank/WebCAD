import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import * as THREE from 'three';
import { useModifyStore } from '../../../store/modifyStore';
import { useSceneStore } from '../../../store/sceneStore';

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
  const clearSelection = useModifyStore(state => state.clearSelection);
  const updateObject = useSceneStore(state => state.updateObject);
  const objects = useSceneStore(state => state.objects);

  useEffect(() => {
    if (mode === 'align' && selectedFace1 && selectedFace2) {
      // Get the source object (the one we'll move)
      const sourceObject = objects.find(obj => obj.id === selectedFace1.objectId);
      if (!sourceObject) return;

      // Calculate the rotation to align normals
      const sourceNormal = selectedFace1.normal;
      const targetNormal = selectedFace2.normal;
      
      // Calculate rotation axis and angle
      const rotationAxis = new THREE.Vector3().crossVectors(sourceNormal, targetNormal).normalize();
      const rotationAngle = sourceNormal.angleTo(targetNormal);

      // Create quaternion for the rotation
      const quaternion = new THREE.Quaternion();
      if (rotationAxis.lengthSq() > 0.001) { // Check if rotation axis is valid
        quaternion.setFromAxisAngle(rotationAxis, rotationAngle);
      }

      // Convert current object rotation to quaternion
      const currentRotation = new THREE.Euler(
        sourceObject.rotation[0],
        sourceObject.rotation[1],
        sourceObject.rotation[2]
      );
      const currentQuaternion = new THREE.Quaternion().setFromEuler(currentRotation);

      // Combine rotations and convert back to euler
      const finalQuaternion = quaternion.multiply(currentQuaternion);
      const finalRotation = new THREE.Euler().setFromQuaternion(finalQuaternion);

      // Calculate the translation needed to align centers
      const translation = new THREE.Vector3()
        .subVectors(selectedFace2.center, selectedFace1.center);

      // Apply the transformation
      const newPosition = new THREE.Vector3(...sourceObject.position).add(translation);

      updateObject(sourceObject.id, {
        position: [newPosition.x, newPosition.y, newPosition.z],
        rotation: [finalRotation.x, finalRotation.y, finalRotation.z]
      });

      // Clear selection after alignment
      clearSelection();
    }
  }, [mode, selectedFace1, selectedFace2, updateObject, objects, clearSelection]);

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
          mode === 'align' ? 'Select face to move' : 'Select first face'
        ) : !selectedFace2 ? (
          mode === 'align' ? 'Select target face to align to' : 'Select second face'
        ) : mode === 'align' ? (
          'Aligning faces...'
        ) : (
          'Measurement complete'
        )}
      </Instructions>
    </OverlayContainer>
  );
} 