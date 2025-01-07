import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useModifyStore } from '../../store/modifyStore';
import { Shape } from './Shape';
import { GroupObject } from './GroupObject';
import { ModifyOverlay } from './modifiers/ModifyOverlay';
import { GlobalFaceSelector } from './modifiers/GlobalFaceSelector';
import { ReferenceOrigin } from './workplane/ReferenceOrigin';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function Viewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);
  const objects = useSceneStore(state => state.objects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const removeObject = useSceneStore(state => state.removeObject);
  const { backgroundColor } = useSettingsStore();
  const { mode, reset } = useModifyStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isViewportActive = containerRef.current?.contains(document.activeElement) || 
                              document.activeElement === document.body;

      if (!isViewportActive) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        
        // Clear modify mode if active
        if (mode !== 'none') {
          reset();
        }
        
        // Clear selection
        setSelectedObjects([]);
      }

      if (e.key === 'Delete' && selectedObjectIds.length > 0) {
        selectedObjectIds.forEach(id => removeObject(id));
        setSelectedObjects([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, setSelectedObjects, removeObject, mode, reset]);

  const rootObjects = objects.filter(obj => !obj.parentId);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        outline: 'none'
      }}
      tabIndex={-1}
      onMouseDown={() => containerRef.current?.focus()}
    >
      <ModifyOverlay />
      
      <Canvas
        camera={{ 
          position: [15, 15, 15],
          up: [0, 0, 1],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        onCreated={({ gl, scene, camera }) => {
          // Initialize PMREM generator
          pmremGeneratorRef.current = new THREE.PMREMGenerator(gl);
          pmremGeneratorRef.current.compileEquirectangularShader();

          // Set environment map
          const environment = pmremGeneratorRef.current.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environment = environment;
          scene.background = new THREE.Color(backgroundColor);

          // Set initial camera position
          camera.position.set(15, 15, 15);
          camera.lookAt(0, 0, 0);
        }}
        style={{
          width: '100%',
          height: '100%',
          background: backgroundColor
        }}
      >
        {/* Set scene background color */}
        <color attach="background" args={[backgroundColor]} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <OrbitControls 
          makeDefault
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          panSpeed={0.5}
          zoomSpeed={0.5}
          minDistance={1}
          maxDistance={500}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          up={[0, 0, 1]}
        />

        <ReferenceOrigin />
        
        {rootObjects.map(object => (
          object.type === 'group' ? (
            <GroupObject key={object.id} object={object} />
          ) : (
            <Shape key={object.id} object={object} />
          )
        ))}

        {mode !== 'none' && <GlobalFaceSelector />}
      </Canvas>
    </div>
  );
}
