import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useSceneStore } from '../../store/sceneStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Shape } from './Shape';
import { GroupObject } from './GroupObject';

export function Viewport() {
  const objects = useSceneStore(state => state.objects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const removeObject = useSceneStore(state => state.removeObject);
  const hoveredObjectId = useSceneStore(state => state.hoveredObjectId);
  const { backgroundColor, showGrid, viewDistance } = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && hoveredObjectId) {
        e.preventDefault();
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

      if (e.key === 'Escape') {
        setSelectedObjects([]);
      }

      if (e.key === 'Delete' && selectedObjectIds.length > 0) {
        selectedObjectIds.forEach(id => removeObject(id));
        setSelectedObjects([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, objects, hoveredObjectId, setSelectedObjects, removeObject]);

  const handleCanvasClick = (e: any) => {
    if (!e.object) {
      setSelectedObjects([]);
    }
  };

  // Only render root-level objects (those without parents)
  const rootObjects = objects.filter(obj => !obj.parentId);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        
        {showGrid && (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <Grid 
              infiniteGrid
              sectionSize={1}
              sectionColor="#2080ff"
              cellSize={0.1}
              cellColor="#808080"
              fadeDistance={viewDistance}
              fadeStrength={1}
            />
          </group>
        )}
        
        <OrbitControls 
          makeDefault
          target={[0, 0, 0]}
          enableDamping={false}
          up={[0, 0, 1]}
        />
        
        {rootObjects.map(object => (
          object.type === 'group' ? (
            <GroupObject key={object.id} object={object} />
          ) : (
            <Shape key={object.id} object={object} />
          )
        ))}
      </Canvas>
    </div>
  );
}