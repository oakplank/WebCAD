import { useState, RefObject, useCallback } from 'react';
import { useSceneStore } from '../../../store/sceneStore';
import { rotationToDegrees } from '../../../utils/rotationUtils';
import * as THREE from 'three';

export function useGroupTransformControls(groupRef: RefObject<THREE.Group>, groupId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const updateObject = useSceneStore(state => state.updateObject);
  const saveState = useSceneStore(state => state.saveState);

  const handleTransformStart = useCallback(() => {
    if (!groupRef.current) return;
    setIsDragging(true);
    saveState();
  }, [saveState]);

  const handleTransform = useCallback(() => {
    if (!groupRef.current || !isDragging) return;

    const position = groupRef.current.position.toArray() as [number, number, number];
    const rotation = rotationToDegrees([
      groupRef.current.rotation.x,
      groupRef.current.rotation.y,
      groupRef.current.rotation.z
    ]);
    const scale = groupRef.current.scale.toArray() as [number, number, number];

    updateObject(groupId, { position, rotation, scale }, false);
  }, [groupId, isDragging, updateObject]);

  const handleTransformEnd = useCallback(() => {
    if (!groupRef.current || !isDragging) return;

    const position = groupRef.current.position.toArray() as [number, number, number];
    const rotation = rotationToDegrees([
      groupRef.current.rotation.x,
      groupRef.current.rotation.y,
      groupRef.current.rotation.z
    ]);
    const scale = groupRef.current.scale.toArray() as [number, number, number];

    updateObject(groupId, { position, rotation, scale }, true);
    setIsDragging(false);
  }, [groupId, isDragging, updateObject]);

  return {
    isDragging,
    handleTransformStart,
    handleTransform,
    handleTransformEnd
  };
}
