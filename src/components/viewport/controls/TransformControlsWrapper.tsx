import React, { useState, useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

interface TransformControlsWrapperProps {
  object: THREE.Object3D;
  onTransformStart: () => void;
  onTransform: () => void;
  onTransformEnd: () => void;
}

export function TransformControlsWrapper({
  object,
  onTransformStart,
  onTransform,
  onTransformEnd
}: TransformControlsWrapperProps) {
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [isTransforming, setIsTransforming] = useState(false);
  const controlsRef = useRef<THREE.TransformControls>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Disable orbit controls while transforming
    const handleMouseDown = () => {
      const dom = document.getElementsByTagName('canvas')[0];
      if (dom) {
        dom.style.cursor = 'move';
      }
      setIsTransforming(true);
      onTransformStart();
    };

    const handleMouseUp = () => {
      const dom = document.getElementsByTagName('canvas')[0];
      if (dom) {
        dom.style.cursor = 'auto';
      }
      setIsTransforming(false);
      onTransformEnd();
    };

    const handleChange = () => {
      if (isTransforming) {
        onTransform();
      }
    };

    controls.addEventListener('mouseDown', handleMouseDown);
    controls.addEventListener('mouseUp', handleMouseUp);
    controls.addEventListener('change', handleChange);

    return () => {
      controls.removeEventListener('mouseDown', handleMouseDown);
      controls.removeEventListener('mouseUp', handleMouseUp);
      controls.removeEventListener('change', handleChange);
    };
  }, [isTransforming, onTransform, onTransformStart, onTransformEnd]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransforming) return;
      
      switch (event.key.toLowerCase()) {
        case 'g':
          setMode('translate');
          break;
        case 'r':
          setMode('rotate');
          break;
        case 's':
          setMode('scale');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransforming]);

  return (
    <TransformControls
      ref={controlsRef}
      object={object}
      mode={mode}
      size={0.75}
      showX
      showY
      showZ
      space="world"
      translationSnap={0.5}
      rotationSnap={Math.PI / 24}
      scaleSnap={0.1}
    />
  );
}
