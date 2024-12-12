import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SceneObject } from '../types/scene.types';

interface SceneData {
  objects: SceneObject[];
  relationships: Record<string, { parent: string | null; children: string[] }>;
}

interface GLTFResult {
  scene: THREE.Scene;
  animations: THREE.AnimationClip[];
}

export class FileService {
  static async exportToGLB(sceneData: SceneData): Promise<Blob> {
    const threeScene = new THREE.Scene();
    
    // Convert our scene objects to Three.js objects
    sceneData.objects.forEach(obj => {
      const mesh = this.createThreeMesh(obj);
      if (mesh) {
        // Apply hierarchy
        const parent = sceneData.relationships[obj.id]?.parent;
        if (parent) {
          const parentObj = threeScene.getObjectByName(parent);
          parentObj?.add(mesh);
        } else {
          threeScene.add(mesh);
        }
      }
    });

    // Export to GLB
    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
      exporter.parse(
        threeScene,
        (buffer) => {
          const blob = new Blob([buffer as ArrayBuffer], {
            type: 'application/octet-stream'
          });
          resolve(blob);
        },
        (error) => {
          reject(error);
        },
        { 
          binary: true,
          includeCustomExtensions: true,
          embedImages: true,
          forceIndices: true, // Ensure indices are included
          truncateDrawRange: false // Preserve full geometry
        }
      );
    });
  }

  static async importFromGLB(file: File): Promise<{ objects: SceneObject[] }> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const url = URL.createObjectURL(file);

      loader.load(url, async (gltf: GLTFResult) => {
        const objects: SceneObject[] = [];
        
        // Get scene bounds for centering only (not scaling)
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());

        gltf.scene.traverse(async (child) => {
          if (child instanceof THREE.Mesh) {
            // Get world transform
            child.updateMatrixWorld(true);
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            child.matrixWorld.decompose(position, quaternion, scale);

            // Extract Euler rotation from quaternion
            const euler = new THREE.Euler().setFromQuaternion(quaternion);

            // Extract material properties
            let color = '#cccccc';
            let metalness = 0.1;
            let roughness = 0.8;

            if (child.material instanceof THREE.Material) {
              if ('color' in child.material && child.material.color instanceof THREE.Color) {
                color = '#' + child.material.color.getHexString();
              }
              if ('metalness' in child.material && typeof child.material.metalness === 'number') {
                metalness = child.material.metalness;
              }
              if ('roughness' in child.material && typeof child.material.roughness === 'number') {
                roughness = child.material.roughness;
              }
            }

            // Center position but preserve scale
            position.sub(center);

            // Create object
            objects.push({
              id: crypto.randomUUID(),
              name: child.name || `Part_${objects.length + 1}`,
              type: 'imported',
              position: [position.x, position.y, position.z] as [number, number, number],
              rotation: [euler.x, euler.y, euler.z] as [number, number, number],
              scale: [scale.x, scale.y, scale.z] as [number, number, number],
              color: color,
              visible: true,
              parentId: null,
              children: [],
              geometry: {
                vertices: Array.from(child.geometry.attributes.position.array),
                indices: child.geometry.index ? Array.from(child.geometry.index.array) : [],
                normals: child.geometry.attributes.normal ? Array.from(child.geometry.attributes.normal.array) : [],
                uvs: child.geometry.attributes.uv ? Array.from(child.geometry.attributes.uv.array) : []
              },
              material: {
                color: color,
                metalness: metalness,
                roughness: roughness
              }
            });
          }
        });

        URL.revokeObjectURL(url);
        resolve({ objects });
      }, 
      (progress: ProgressEvent) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      (error: Error) => {
        console.error('GLB loading error:', error);
        URL.revokeObjectURL(url);
        reject(error);
      });
    });
  }

  private static createThreeMesh(obj: SceneObject): THREE.Mesh | null {
    let geometry: THREE.BufferGeometry;

    if (obj.type === 'imported' && obj.geometry) {
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(obj.geometry.vertices, 3));
      if (obj.geometry.indices.length > 0) {
        geometry.setIndex(obj.geometry.indices);
      }
      if (obj.geometry.normals.length > 0) {
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(obj.geometry.normals, 3));
      }
      if (obj.geometry.uvs && obj.geometry.uvs.length > 0) {
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(obj.geometry.uvs, 2));
      }
      geometry.computeBoundingSphere(); // Ensure proper bounds
    } else {
      switch (obj.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry();
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry();
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry();
          break;
        default:
          return null;
      }
    }

    // Create material with object's color and properties
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(obj.material?.color || obj.color),
      metalness: obj.material?.metalness ?? 0.1,
      roughness: obj.material?.roughness ?? 0.2,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...obj.position);
    mesh.rotation.set(...obj.rotation);
    mesh.scale.set(...obj.scale);
    mesh.name = obj.id;
    mesh.visible = obj.visible;

    return mesh;
  }
}
