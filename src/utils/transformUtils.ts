import * as THREE from 'three';
import { SceneObject } from '../types/scene.types';

export function calculateGroupCentroid(group: SceneObject, objects: SceneObject[]): THREE.Vector3 {
  const children = objects.filter(obj => obj.parentId === group.id);
  if (children.length === 0) return new THREE.Vector3();

  const center = children.reduce((acc, child) => {
    const worldPos = new THREE.Vector3(...child.position);
    return acc.add(worldPos);
  }, new THREE.Vector3());

  return center.divideScalar(children.length);
}

export function updateGroupChildren(
  groupId: string,
  objects: SceneObject[],
  updateFn: (object: SceneObject) => Partial<SceneObject>
): SceneObject[] {
  return objects.map(obj => {
    if (obj.parentId === groupId) {
      return {
        ...obj,
        ...updateFn(obj)
      };
    }
    return obj;
  });
}

export function getWorldTransform(object: SceneObject, objects: SceneObject[]) {
  let worldPosition = [...object.position];
  let worldRotation = [...object.rotation];
  let worldScale = [...object.scale];

  let currentObj = object;
  while (currentObj.parentId) {
    const parent = objects.find(obj => obj.id === currentObj.parentId);
    if (!parent) break;

    worldPosition = [
      worldPosition[0] * parent.scale[0] + parent.position[0],
      worldPosition[1] * parent.scale[1] + parent.position[1],
      worldPosition[2] * parent.scale[2] + parent.position[2]
    ];

    worldRotation = [
      worldRotation[0] + parent.rotation[0],
      worldRotation[1] + parent.rotation[1],
      worldRotation[2] + parent.rotation[2]
    ];

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