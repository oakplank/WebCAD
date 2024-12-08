import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

function Shape({ object }: { object: SceneObject }) {
  const isSelected = useSceneStore(state => state.selectedObjectId === object.id);
  const viewMode = useSceneStore(state => state.viewMode);
  const setSelectedObject = useSceneStore(state => state.setSelectedObject);
  const updateObject = useSceneStore(state => state.updateObject);
  const duplicateObject = useSceneStore(state => state.duplicateObject);
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useEffect(() => {
    if (transformRef.current) {
      const controls = transformRef.current;
      const callback = (event: KeyboardEvent) => {
        switch (event.key.toLowerCase()) {
          case 'g':
            controls.setMode('translate');
            break;
          case 'r':
            controls.setMode('rotate');
            break;
          case 's':
            controls.setMode('scale');
            break;
        }
      };

      window.addEventListener('keydown', callback);
      return () => window.removeEventListener('keydown', callback);
    }
  }, [transformRef]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelectedObject(object.id);
  };

  const handleTransformStart = (e: any) => {
    if (e.ctrlKey || e.metaKey) {
      duplicateObject(object.id);
    }
  };

  const handleTransform = () => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray();
      const rotation = meshRef.current.rotation.toArray().slice(0, 3);
      const scale = meshRef.current.scale.toArray();
      
      updateObject(object.id, {
        position: position as [number, number, number],
        rotation: rotation as [number, number, number],
        scale: scale as [number, number, number]
      });
    }
  };

  if (!object.visible) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={new THREE.Vector3(...object.position)}
        rotation={new THREE.Euler(...object.rotation)}
        scale={new THREE.Vector3(...object.scale)}
        onClick={handleClick}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer';
          e.stopPropagation();
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
          e.stopPropagation();
        }}
      >
        {object.type === 'cube' && <boxGeometry />}
        {object.type === 'sphere' && <sphereGeometry />}
        {object.type === 'cylinder' && <cylinderGeometry />}
        {viewMode === 'surface' ? (
          <meshBasicMaterial 
            color={object.color}
          />
        ) : (
          <meshStandardMaterial 
            color={object.color}
            wireframe={viewMode === 'wireframe'}
            roughness={0.2}
            metalness={0.1}
            emissive={object.color}
            emissiveIntensity={0.1}
          />
        )}
      </mesh>

      {/* Edges for all modes except wireframe */}
      {viewMode !== 'wireframe' && (
        <lineSegments
          ref={edgesRef}
          position={new THREE.Vector3(...object.position)}
          rotation={new THREE.Euler(...object.rotation)}
          scale={new THREE.Vector3(...object.scale)}
        >
          <edgesGeometry args={[
            object.type === 'cube' 
              ? new THREE.BoxGeometry() 
              : object.type === 'sphere'
              ? new THREE.SphereGeometry(1, 32, 32)
              : new THREE.CylinderGeometry(1, 1, 2, 32)
          ]} />
          <lineBasicMaterial 
            color={isSelected ? '#0066cc' : '#000000'}
            linewidth={isSelected ? 2 : 1}
            transparent={true}
            opacity={isSelected ? 1 : viewMode === 'shaded' ? 0.15 : 0.7}
            depthTest={!isSelected}
          />
        </lineSegments>
      )}

      {isSelected && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          onObjectChange={handleTransform}
          onMouseDown={handleTransformStart}
          mode="translate"
          space="world"
        />
      )}
    </group>
  );
}

export function Viewport() {
  const objects = useSceneStore(state => state.objects);
  const setSelectedObject = useSceneStore(state => state.setSelectedObject);

  const handleCanvasClick = (e: any) => {
    if (e.object === null) {
      setSelectedObject(null);
    }
  };

  return (
    <Canvas
      camera={{ 
        position: [15, 15, 15],
        up: [0, 0, 1],
        fov: 45
      }}
      style={{ width: '100%', height: '100%' }}
      onClick={handleCanvasClick}
    >
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Grid 
          infiniteGrid
          sectionSize={1}
          sectionColor="#2080ff"
          cellSize={0.1}
          cellColor="#808080"
          fadeDistance={30}
          fadeStrength={1}
        />
      </group>
      
      <OrbitControls 
        makeDefault
        target={[0, 0, 0]}
        enableDamping={false}
        up={[0, 0, 1]}
      />
      
      {objects.map(object => (
        <Shape key={object.id} object={object} />
      ))}
    </Canvas>
  );
} 