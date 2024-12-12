import React, { useRef, useMemo } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import { useShapeInteraction } from './hooks/useShapeInteraction';
import { useGroupTransformControls } from './hooks/useGroupTransformControls';
import { rotationToRadians } from '../../utils/rotationUtils';
import { TransformControlsWrapper } from './controls/TransformControlsWrapper';
import { GroupVisualizer } from './visualizers/GroupVisualizer';
import { Shape } from './Shape';
import * as THREE from 'three';

interface GroupObjectProps {
  object: SceneObject;
}

export function GroupObject({ object }: GroupObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isSelected = useSceneStore(state => state.selectedObjectIds.includes(object.id));
  const objects = useSceneStore(state => state.objects);
  
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
  } = useGroupTransformControls(groupRef, object.id);

  // Calculate group centroid based on children's positions
  const centroid = useMemo(() => {
    const children = objects.filter(obj => obj.parentId === object.id);
    if (children.length === 0) return new THREE.Vector3();

    const center = children.reduce((acc, child) => {
      const worldPos = new THREE.Vector3(...child.position);
      return acc.add(worldPos);
    }, new THREE.Vector3());

    return center.divideScalar(children.length);
  }, [object.id, objects]);

  if (!object.visible) return null;

  const rotationRad = rotationToRadians(object.rotation);
  const childObjects = objects.filter(obj => obj.parentId === object.id);

  return (
    <>
      <group
        ref={groupRef}
        name={object.id}
        position={object.position}
        rotation={rotationRad}
        scale={object.scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Render child objects */}
        {childObjects.map(child => (
          <Shape key={child.id} object={child} />
        ))}
        
        <GroupVisualizer
          centroid={centroid}
          isSelected={isSelected}
          isHovered={isHovered}
        />
      </group>

      {isSelected && groupRef.current && (
        <TransformControlsWrapper
          key={`transform-${object.id}`}
          object={groupRef.current}
          onTransformStart={handleTransformStart}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
}
