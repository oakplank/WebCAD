import React, { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Face } from '../../../types/scene.types';
import { FaceHighlight } from './FaceHighlight';
import { useModifyStore } from '../../../store/modifyStore';
import { extractFaces } from '../../../utils/faceUtils';

export function GlobalFaceSelector() {
  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [currentFaceIndex, setCurrentFaceIndex] = useState<number>(-1);
  const { scene, camera, raycaster } = useThree();
  const setSelectedFace1 = useModifyStore(state => state.setSelectedFace1);
  const setSelectedFace2 = useModifyStore(state => state.setSelectedFace2);
  const selectedFace1 = useModifyStore(state => state.selectedFace1);
  const mode = useModifyStore(state => state.mode);

  const updateHoveredMesh = useCallback((mesh: THREE.Mesh | null) => {
    if (!mesh) {
      setHoveredMesh(null);
      setFaces([]);
      setCurrentFaceIndex(-1);
      return;
    }

    if (mesh !== hoveredMesh) {
      setHoveredMesh(mesh);
      const objectId = mesh.userData.id || mesh.uuid;
      const newFaces = extractFaces(mesh, objectId);
      setFaces(newFaces);
      setCurrentFaceIndex(0);
    }
  }, [hoveredMesh]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundMesh: THREE.Mesh | null = null;
      for (const intersect of intersects) {
        if (intersect.object instanceof THREE.Mesh) {
          foundMesh = intersect.object;
          break;
        }
      }
      
      updateHoveredMesh(foundMesh);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f' && faces.length > 0) {
        event.preventDefault();
        setCurrentFaceIndex(prev => (prev + 1) % faces.length);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!hoveredMesh || currentFaceIndex < 0 || !faces[currentFaceIndex]) return;

      const selectedFace = faces[currentFaceIndex];
      if (!selectedFace1) {
        setSelectedFace1(selectedFace);
      } else if (selectedFace1.objectId !== selectedFace.objectId || 
                 !selectedFace1.center.equals(selectedFace.center)) {
        setSelectedFace2(selectedFace);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [camera, raycaster, scene, faces, currentFaceIndex, selectedFace1, updateHoveredMesh, setSelectedFace1, setSelectedFace2]);

  // Debug logging
  useEffect(() => {
    if (hoveredMesh) {
      console.log('Hovered mesh:', hoveredMesh);
      console.log('Current face index:', currentFaceIndex);
      console.log('Available faces:', faces);
    }
  }, [hoveredMesh, currentFaceIndex, faces]);

  return (
    <>
      {hoveredMesh && currentFaceIndex >= 0 && faces[currentFaceIndex] && (
        <FaceHighlight
          face={faces[currentFaceIndex]}
          color="#2196f3"
          opacity={0.3}
        />
      )}
      {selectedFace1 && (
        <FaceHighlight
          face={selectedFace1}
          color="#4caf50"
          opacity={0.5}
        />
      )}
    </>
  );
}
