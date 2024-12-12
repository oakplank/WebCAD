import * as THREE from 'three';
import { SceneObject } from '../types/scene.types';

export function getWorldTransform(object: SceneObject, objects: SceneObject[]) {
  let worldPosition = [...object.position];
  let worldRotation = [...object.rotation];
  let worldScale = [...object.scale];

  let currentObj = object;
  while (currentObj.parentId) {
    const parent = objects.find(obj => obj.id === currentObj.parentId);
    if (!parent) break;

    // Update position
    worldPosition = [
      worldPosition[0] * parent.scale[0] + parent.position[0],
      worldPosition[1] * parent.scale[1] + parent.position[1],
      worldPosition[2] * parent.scale[2] + parent.position[2]
    ];

    // Update rotation
    worldRotation = [
      worldRotation[0] + parent.rotation[0],
      worldRotation[1] + parent.rotation[1],
      worldRotation[2] + parent.rotation[2]
    ];

    // Update scale
    worldScale = [
      worldScale[0] * parent.scale[0],
      worldScale[1] * parent.scale[1],
      worldScale[2] * parent.scale[2]
    ];

    currentObj = parent;
  }

  return {
    position: worldPosition as [number, number, number],
    rotation: worldRotation as [number, number, number],
    scale: worldScale as [number, number, number]
  };
}

export function updateChildTransforms(
  objects: SceneObject[],
  parentId: string,
  parentTransform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }
): SceneObject[] {
  return objects.map(obj => {
    if (obj.parentId === parentId) {
      const worldTransform = getWorldTransform(obj, objects);
      
      // Calculate relative position
      const newPosition: [number, number, number] = [
        (worldTransform.position[0] - parentTransform.position[0]) / parentTransform.scale[0],
        (worldTransform.position[1] - parentTransform.position[1]) / parentTransform.scale[1],
        (worldTransform.position[2] - parentTransform.position[2]) / parentTransform.scale[2]
      ];

      // Calculate relative rotation
      const newRotation: [number, number, number] = [
        worldTransform.rotation[0] - parentTransform.rotation[0],
        worldTransform.rotation[1] - parentTransform.rotation[1],
        worldTransform.rotation[2] - parentTransform.rotation[2]
      ];

      // Calculate relative scale
      const newScale: [number, number, number] = [
        worldScale[0] / parentTransform.scale[0],
        worldScale[1] / parentTransform.scale[1],
        worldScale[2] / parentTransform.scale[2]
      ];

      const updatedObj = {
        ...obj,
        position: newPosition,
        rotation: newRotation,
        scale: newScale
      };

      // Recursively update children if this is also a group
      if (obj.type === 'group') {
        return updateChildTransforms(objects, obj.id, {
          position: newPosition,
          rotation: newRotation,
          scale: newScale
        })[objects.findIndex(o => o.id === obj.id)];
      }

      return updatedObj;
    }
    return obj;
  });
}
