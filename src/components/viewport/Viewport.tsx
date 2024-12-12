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
  const isViewportFocused = useRef(false);
  const objects = useSceneStore(state => state.objects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const removeObject = useSceneStore(state => state.removeObject);
  const { backgroundColor } = useSettingsStore();
  const { mode, reset } = useModifyStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = () => {
      isViewportFocused.current = true;
    };

    const handleBlur = () => {
      isViewportFocused.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isViewportFocused.current) return;

      if (e.key === 'Escape') {
        if (mode !== 'none') {
          e.preventDefault();
          reset();
          return;
        }
        if (selectedObjectIds.length > 0) {
          setSelectedObjects([]);
        }
      }

      if (e.key === 'Delete' && selectedObjectIds.length > 0) {
        selectedObjectIds.forEach(id => removeObject(id));
        setSelectedObjects([]);
      }
    };

    container.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        if (mode === 'none') {
          setSelectedObjects([]);
        }
      } else {
        container.focus();
      }
    };

    container.addEventListener('focus', handleFocus);
    container.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);

    return () => {
      container.removeEventListener('focus', handleFocus);
      container.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [selectedObjectIds, setSelectedObjects, removeObject, mode, reset]);

  const handleCanvasClick = (event: any) => {
    if (!event.object && mode === 'none') {
      setSelectedObjects([]);
    }
  };

  const rootObjects = objects.filter(obj => !obj.parentId);

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      tabIndex={0}
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
        onClick={handleCanvasClick}
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
