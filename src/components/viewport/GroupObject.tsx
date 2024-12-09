import React, { useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface GroupObjectProps {
  object: SceneObject;
}

export function GroupObject({ object }: GroupObjectProps) {
  const isSelected = useSceneStore(state => state.selectedObjectIds.includes(object.id));
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const updateObject = useSceneStore(state => state.updateObject);
  const duplicateObject = useSceneStore(state => state.duplicateObject);
  const saveState = useSceneStore(state => state.saveState);
  const objects = useSceneStore(state => state.objects);
  const setHoveredObject = useSceneStore(state => state.setHoveredObject);
  
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Calculate group centroid based on children's positions
  const centroid = React.useMemo(() => {
    const children = objects.filter(obj => obj.parentId === object.id);
    if (children.length === 0) return new THREE.Vector3();

    const center = children.reduce((acc, child) => {
      const worldPos = new THREE.Vector3(...child.position);
      return acc.add(worldPos);
    }, new THREE.Vector3());

    return center.divideScalar(children.length);
  }, [object.id, objects]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelectedObjects(prev => [...prev, object.id]);
    } else {
      setSelectedObjects([object.id]);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setHoveredObject(object.id);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    setHoveredObject(null);
  };

  const handleTransformStart = (e: any) => {
    if (e.ctrlKey || e.metaKey) {
      duplicateObject(object.id);
    } else {
      setIsDragging(true);
      saveState();
    }
  };

  const handleTransform = () => {
    if (groupRef.current) {
      const position = groupRef.current.position.toArray();
      const rotation = groupRef.current.rotation.toArray().slice(0, 3);
      const scale = groupRef.current.scale.toArray();
      
      updateObject(object.id, {
        position: position as [number, number, number],
        rotation: rotation as [number, number, number],
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

  return (
    <group
      ref={groupRef}
      position={new THREE.Vector3(...object.position)}
      rotation={new THREE.Euler(...object.rotation)}
      scale={new THREE.Vector3(...object.scale)}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {isSelected && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          onObjectChange={handleTransform}
          onMouseDown={handleTransformStart}
          onMouseUp={handleTransformEnd}
          mode="translate"
          space="world"
          position={centroid}
        />
      )}

      {/* Visual representation of the group's center */}
      <group position={centroid}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={6}
              array={new Float32Array([
                -0.5, 0, 0, 0.5, 0, 0,
                0, -0.5, 0, 0, 0.5, 0,
                0, 0, -0.5, 0, 0, 0.5
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={isSelected ? '#0066cc' : '#666666'}
            transparent
            opacity={0.5}
            depthTest={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}