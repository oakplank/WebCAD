import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/sceneStore';
import { useModifyStore } from '../../store/modifyStore';
import { SceneObject } from '../../types/scene.types';
import { rotationToRadians } from '../../utils/rotationUtils';
import { useShapeInteraction } from './hooks/useShapeInteraction';
import { useTransformControls } from './hooks/useTransformControls';
import { ShapeMesh } from './mesh/ShapeMesh';
import { ShapeEdges } from './edges/ShapeEdges';
import { TransformControlsWrapper } from './controls/TransformControlsWrapper';

interface ShapeProps {
  object: SceneObject;
}

export function Shape({ object }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const viewMode = useSceneStore(state => state.viewMode);
  const isSelected = useSceneStore(state => state.selectedObjectIds.includes(object.id));
  const mode = useModifyStore(state => state.mode);
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.id = object.id;
    }
  }, [object.id]);

  const {
    isHovered,
    handleClick,
    handlePointerOver,
    handlePointerOut
  } = useShapeInteraction(object.id);

  const {
    handleTransformStart,
    handleTransform,
    handleTransformEnd
  } = useTransformControls(meshRef, object.id);

  useEffect(() => {
    if (meshRef.current && meshRef.current.geometry) {
      const geometry = meshRef.current.geometry;
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }
      if (!geometry.index) {
        geometry.setIndex(Array.from({ length: geometry.attributes.position.count }, (_, i) => i));
      }
    }
  }, [object]);

  if (!object.visible) return null;

  const rotationRad = rotationToRadians(object.rotation);

  return (
    <>
      <mesh
        ref={meshRef}
        position={object.position}
        rotation={rotationRad}
        scale={object.scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <ShapeMesh
          type={object.type}
          color={object.color}
          viewMode={viewMode}
          geometry={object.geometry}
        />
        <ShapeEdges
          type={object.type}
          viewMode={viewMode}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      </mesh>

      {isSelected && mode === 'none' && meshRef.current && (
        <TransformControlsWrapper
          object={meshRef.current}
          onTransformStart={handleTransformStart}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
}
