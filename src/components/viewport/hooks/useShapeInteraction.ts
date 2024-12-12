import { useState } from 'react';
import { useSceneStore } from '../../../store/sceneStore';
import { ThreeEvent } from '@react-three/fiber';

export function useShapeInteraction(objectId: string, disableSelection: boolean = false) {
  const [isHovered, setIsHovered] = useState(false);
  const setSelectedObjects = useSceneStore(state => state.setSelectedObjects);
  const selectedObjectIds = useSceneStore(state => state.selectedObjectIds);
  const setHoveredObject = useSceneStore(state => state.setHoveredObject);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (disableSelection) return;
    
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      if (selectedObjectIds.includes(objectId)) {
        setSelectedObjects(selectedObjectIds.filter(id => id !== objectId));
      } else {
        setSelectedObjects([...selectedObjectIds, objectId]);
      }
    } else {
      setSelectedObjects([objectId]);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (disableSelection) return;
    
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    setHoveredObject(objectId);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    if (disableSelection) return;
    
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
    document.body.style.cursor = 'default';
    setIsHovered(false);
    setHoveredObject(null);
  };

  return {
    isHovered,
    handleClick,
    handlePointerOver,
    handlePointerOut
  };
}
