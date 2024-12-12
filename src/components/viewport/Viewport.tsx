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

export function Viewport() {
  const containerRef = useRef<HTMLDivElement>(null);
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
          fov: 45
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: backgroundColor 
        }}
      >
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        <OrbitControls 
          makeDefault
          target={[0, 0, 0]}
          enableDamping={false}
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
