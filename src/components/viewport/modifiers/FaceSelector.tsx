import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Face } from '../../../types/scene.types';
import { FaceHighlight } from './FaceHighlight';
import { useModifyStore } from '../../../store/modifyStore';
import { extractFaces } from '../../../utils/faceUtils';

interface FaceSelectorProps {
  object: THREE.Mesh;
  isFirstFace: boolean;
}

export function FaceSelector({ object, isFirstFace }: FaceSelectorProps) {
  const [faces, setFaces] = useState<Face[]>([]);
  const [hoveredFaceIndex, setHoveredFaceIndex] = useState<number>(-1);
  const { camera, raycaster } = useThree();
  const setSelectedFace1 = useModifyStore(state => state.setSelectedFace1);
  const setSelectedFace2 = useModifyStore(state => state.setSelectedFace2);
  const mode = useModifyStore(state => state.mode);

  useEffect(() => {
    if (object && object.geometry) {
      const extractedFaces = extractFaces(object);
      setFaces(extractedFaces);
    }
  }, [object]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && faces.length > 0) {
        event.preventDefault();
        setHoveredFaceIndex(prev => (prev + 1) % faces.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [faces]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!object || !object.geometry) return;

      // Update raycaster
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(object);

      if (intersects.length > 0) {
        const faceIndex = Math.floor(intersects[0].faceIndex! / 2);
        setHoveredFaceIndex(faceIndex);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [object, camera, raycaster]);

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    if (hoveredFaceIndex >= 0 && hoveredFaceIndex < faces.length) {
      const selectedFace = faces[hoveredFaceIndex];
      if (isFirstFace) {
        setSelectedFace1(selectedFace);
      } else {
        setSelectedFace2(selectedFace);
        if (mode === 'measure') {
          // Calculate distance between face centers
          const distance = selectedFace.center.distanceTo(faces[hoveredFaceIndex].center);
          useModifyStore.getState().setMeasurementResult(distance);
        }
      }
    }
  };

  if (!object || hoveredFaceIndex === -1) return null;

  return (
    <group onClick={handleClick}>
      {hoveredFaceIndex >= 0 && hoveredFaceIndex < faces.length && (
        <FaceHighlight
          face={faces[hoveredFaceIndex]}
          color="#2196f3"
          opacity={0.3}
        />
      )}
    </group>
  );
}
