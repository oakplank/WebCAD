import React, { useRef, useState } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { rotationToRadians, rotationToDegrees } from '../../utils/rotationUtils';
import { ShapeMesh } from './mesh/ShapeMesh';
import { ShapeEdges } from './edges/ShapeEdges';

interface ShapeProps {
  object: SceneObject;
}

export function Shape({ object }: ShapeProps) {
  const isSelected = useSceneStore(state => state.selectedObjectIds.includes(object.id));
  const viewMode = useSceneStore(state => state.viewMode);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const updateObject = useSceneStore(state => state.updateObject);
  const saveState = useSceneStore(state => state.saveState);
  const setHoveredObject = useSceneStore(state => state.setHoveredObject);
  
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      if (isSelected) {
        setSelectedObjects(selectedObjectIds.filter(id => id !== object.id));
      } else {
        setSelectedObjects([...selectedObjectIds, object.id]);
      }
    } else {
      setSelectedObjects([object.id]);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    setHoveredObject(object.id);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    setIsHovered(false);
    setHoveredObject(null);
  };

  const handleTransformStart = () => {
    setIsDragging(true);
    saveState();
  };

  const handleTransform = () => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray();
      const rotation = rotationToDegrees(meshRef.current.rotation.toArray().slice(0, 3) as [number, number, number]);
      const scale = meshRef.current.scale.toArray();
      
      updateObject(object.id, {
        position: position as [number, number, number],
        rotation,
        scale: scale as [number, number, number]
      }, false);
    }
  };

  const handleTransformEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      saveState();
    }
  };

  if (!object.visible) return null;

  const rotationRad = rotationToRadians(object.rotation);

  return (
    <>
      <ShapeMesh 
        ref={meshRef}
        type={object.type}
        color={object.color}
        viewMode={viewMode}
        position={object.position}
        rotation={rotationRad}
        scale={object.scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      <ShapeEdges
        type={object.type}
        viewMode={viewMode}
        isSelected={isSelected}
        isHovered={isHovered}
        position={object.position}
        rotation={rotationRad}
        scale={object.scale}
      />

      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          onObjectChange={handleTransform}
          onDraggingChange={({ value }) => {
            if (!value) handleTransformEnd();
            else handleTransformStart();
          }}
          mode="translate"
          space="world"
        />
      )}
    </>
  );
}