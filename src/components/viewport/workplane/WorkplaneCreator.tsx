import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useWorkplaneToolStore } from '../../../store/workplaneToolStore';
import { useWorkplaneStore } from '../../../store/workplaneStore';

export function WorkplaneCreator() {
  const { scene, camera, raycaster } = useThree();
  const {
    isActive,
    creationMethod,
    creationState,
    updateCreationState,
    reset
  } = useWorkplaneToolStore();

  const addWorkplane = useWorkplaneStore(state => state.addWorkplane);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Update raycaster for face/point selection
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    };

    const handleClick = (event: MouseEvent) => {
      if (creationMethod === 'threePoint') {
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          const newPoints = [...creationState.pointsCollected, point];
          
          if (newPoints.length === 3) {
            // Create plane from three points
            const v1 = new THREE.Vector3().subVectors(newPoints[1], newPoints[0]);
            const v2 = new THREE.Vector3().subVectors(newPoints[2], newPoints[0]);
            const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
            
            addWorkplane('custom', {
              origin: [newPoints[0].x, newPoints[0].y, newPoints[0].z],
              normal: [normal.x, normal.y, normal.z],
              up: [0, 1, 0] // Calculate proper up vector based on normal
            });
            
            reset();
          } else {
            updateCreationState({ pointsCollected: newPoints });
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        reset();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, creationMethod, creationState, camera, raycaster, scene, updateCreationState, addWorkplane, reset]);

  return null; // This component only handles events
}
