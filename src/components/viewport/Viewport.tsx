import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import { useSceneStore } from '../../store/sceneStore';
import { SceneObject } from '../../types/scene.types';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

function Shape({ object }: { object: SceneObject }) {
  const isSelected = useSceneStore(state => state.selectedObjectIds.includes(object.id));
  const viewMode = useSceneStore(state => state.viewMode);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const updateObject = useSceneStore(state => state.updateObject);
  const duplicateObject = useSceneStore(state => state.duplicateObject);
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hoveredObjectId = useSceneStore(state => state.hoveredObjectId);
  const setHoveredObject = useSceneStore(state => state.setHoveredObject);
  const objects = useSceneStore(state => state.objects);

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
    
    // If it's a child object, select its parent group first
    if (object.parentId) {
      const parentObject = objects.find(obj => obj.id === object.parentId);
      if (parentObject && parentObject.type === 'group') {
        setSelectedObjects([object.parentId]);
      } else {
        // If parent is not a group or doesn't exist, select the object directly
        if (e.ctrlKey) {
          setSelectedObjects(prev => [...prev, object.id]);
        } else {
          setSelectedObjects([object.id]);
        }
      }
    } else {
      // If it's a root object or group, select it directly
      if (e.ctrlKey) {
        setSelectedObjects(prev => [...prev, object.id]);
      } else {
        setSelectedObjects([object.id]);
      }
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

  const createGeometry = () => {
    if (object.type === 'imported' && object.geometry) {
      const geometry = new THREE.BufferGeometry();
      
      // Set vertices
      const vertices = new Float32Array(object.geometry.vertices);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      // Set indices if they exist
      if (object.geometry.indices.length > 0) {
        geometry.setIndex(object.geometry.indices);
      }
      
      // Set normals if they exist
      if (object.geometry.normals.length > 0) {
        const normals = new Float32Array(object.geometry.normals);
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      }
      
      // Set UVs if they exist
      if (object.geometry.uvs && object.geometry.uvs.length > 0) {
        const uvs = new Float32Array(object.geometry.uvs);
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      }

      // Compute normals if they don't exist
      if (!object.geometry.normals.length) {
        geometry.computeVertexNormals();
      }
      
      return geometry;
    }

    // Handle basic shapes as before
    switch (object.type) {
      case 'cube': return new THREE.BoxGeometry();
      case 'sphere': return new THREE.SphereGeometry();
      case 'cylinder': return new THREE.CylinderGeometry();
      default: return new THREE.BoxGeometry(); // fallback
    }
  };

  const createMaterial = () => {
    if (viewMode === 'surface') {
      return (
        <meshBasicMaterial 
          color={object.color}
          map={object.material?.map ? new THREE.TextureLoader().load(object.material.map) : null}
        />
      );
    }

    return (
      <meshStandardMaterial 
        color={object.color}
        wireframe={viewMode === 'wireframe'}
        roughness={object.material?.roughness ?? 0.2}
        metalness={object.material?.metalness ?? 0.1}
        map={object.material?.map ? new THREE.TextureLoader().load(object.material.map) : null}
        normalMap={object.material?.normalMap ? new THREE.TextureLoader().load(object.material.normalMap) : null}
        roughnessMap={object.material?.roughnessMap ? new THREE.TextureLoader().load(object.material.roughnessMap) : null}
        metalnessMap={object.material?.metalnessMap ? new THREE.TextureLoader().load(object.material.metalnessMap) : null}
        alphaMap={object.material?.alphaMap ? new THREE.TextureLoader().load(object.material.alphaMap) : null}
        aoMap={object.material?.aoMap ? new THREE.TextureLoader().load(object.material.aoMap) : null}
        emissiveMap={object.material?.emissiveMap ? new THREE.TextureLoader().load(object.material.emissiveMap) : null}
        envMap={object.material?.envMap ? new THREE.TextureLoader().load(object.material.envMap) : null}
      />
    );
  };

  if (object.type === 'group') {
    return (
      <group
        position={new THREE.Vector3(...object.position)}
        rotation={new THREE.Euler(...object.rotation)}
        scale={new THREE.Vector3(...object.scale)}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {isSelected && (
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

  if (!object.visible) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={new THREE.Vector3(...object.position)}
        rotation={new THREE.Euler(...object.rotation)}
        scale={new THREE.Vector3(...object.scale)}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive object={createGeometry()} attach="geometry" />
        {viewMode === 'surface' ? (
          <meshBasicMaterial 
            color={object.color}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial 
            color={object.color}
            wireframe={viewMode === 'wireframe'}
            roughness={object.material?.roughness ?? 0.2}
            metalness={object.material?.metalness ?? 0.1}
            side={THREE.DoubleSide}
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

      {/* Add highlight for hovered state */}
      {isHovered && (
        <lineSegments>
          <edgesGeometry args={[createGeometry()]} />
          <lineBasicMaterial 
            color="#ffff00"
            transparent
            opacity={0.5}
            depthTest={false}
          />
        </lineSegments>
      )}
    </group>
  );
}

export function Viewport() {
  const objects = useSceneStore(state => state.objects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const hoveredObjectId = useSceneStore(state => state.hoveredObjectId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && hoveredObjectId) {
        e.preventDefault();
        // If a group is selected and we're hovering over one of its children
        if (selectedObjectIds.length === 1) {
          const selectedObject = objects.find(obj => obj.id === selectedObjectIds[0]);
          if (selectedObject?.type === 'group') {
            const hoveredObject = objects.find(obj => obj.id === hoveredObjectId);
            if (hoveredObject?.parentId === selectedObject.id) {
              setSelectedObjects([hoveredObject.id]);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, objects, hoveredObjectId, setSelectedObjects]);

  const handleCanvasClick = (e: any) => {
    // Only clear selection if clicking on empty space
    if (!e.object) {
      setSelectedObjects([]);
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