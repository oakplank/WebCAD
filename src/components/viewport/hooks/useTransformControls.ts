import { useState, RefObject } from 'react';
import { useSceneStore } from '../../../store/sceneStore';
import { rotationToDegrees } from '../../../utils/rotationUtils';
import * as THREE from 'three';

export function useTransformControls(objectRef: RefObject<THREE.Object3D>, objectId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const updateObject = useSceneStore(state => state.updateObject);
  const saveState = useSceneStore(state => state.saveState);

  const handleTransformStart = () => {
    setIsDragging(true);
    saveState();
  };

  const handleTransform = () => {
    // During transform, we don't update the state
    // This allows the visual transform without affecting the stored state
  };

  const handleTransformEnd = () => {
    if (!isDragging || !objectRef.current) return;
    
    setIsDragging(false);
    
    // Update state only when transform ends
    const position = objectRef.current.position.toArray();
    const rotation = rotationToDegrees(objectRef.current.rotation.toArray().slice(0, 3) as [number, number, number]);
    const scale = objectRef.current.scale.toArray();
    
    updateObject(objectId, {
      position: position as [number, number, number],
      rotation,
      scale: scale as [number, number, number]
    }, true); // Save state with the update
  };

  return {
    isDragging,
    handleTransformStart,
    handleTransform,
    handleTransformEnd
  };
}
