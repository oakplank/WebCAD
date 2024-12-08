import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SceneObject } from '../types/scene.types';

interface SceneData {
  objects: SceneObject[];
  relationships: Record<string, { parent: string | null; children: string[] }>;
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
          embedImages: true
        }
      );
    });
  }

  static async importFromGLB(file: File): Promise<{ objects: SceneObject[] }> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const url = URL.createObjectURL(file);

      loader.load(url, async (gltf) => {
        // Create root group for imported model
        const rootId = crypto.randomUUID();
        const objects: SceneObject[] = [{
          id: rootId,
          name: 'Imported Model',
          type: 'group',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#cccccc',
          visible: true,
          parentId: null,
          children: []
        }];
        
        // Center and normalize the model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const normalizeScale = 10 / maxDim;

        gltf.scene.traverse(async (child) => {
          if (child instanceof THREE.Mesh) {
            // Get world position and scale only
            child.updateMatrixWorld(true);
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            child.matrixWorld.decompose(position, new THREE.Quaternion(), scale);

            // Center and normalize position
            position.sub(center);
            position.multiplyScalar(normalizeScale);

            // Create object with no rotation
            const objectId = crypto.randomUUID();
            objects.push({
              id: objectId,
              name: child.name || `Part_${objects.length}`,
              type: 'imported',
              position: [position.x, position.y, position.z] as [number, number, number],
              rotation: [0, 0, 0], // Reset all rotations
              scale: [scale.x * normalizeScale, scale.y * normalizeScale, scale.z * normalizeScale] as [number, number, number],
              color: '#cccccc',
              visible: true,
              parentId: rootId,
              children: [],
              geometry: {
                vertices: Array.from(child.geometry.attributes.position.array),
                indices: child.geometry.index ? Array.from(child.geometry.index.array) : [],
                normals: child.geometry.attributes.normal ? Array.from(child.geometry.attributes.normal.array) : [],
                uvs: child.geometry.attributes.uv ? Array.from(child.geometry.attributes.uv.array) : []
              },
              material: {
                color: '#cccccc',
                metalness: 0.1,
                roughness: 0.8
              }
            });

            // Add to root's children
            objects[0].children.push(objectId);
          }
        });

        URL.revokeObjectURL(url);
        resolve({ objects });
      }, 
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      (error) => {
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

    const material = new THREE.MeshStandardMaterial({
      color: obj.color,
      metalness: obj.material?.metalness ?? 0.1,
      roughness: obj.material?.roughness ?? 0.2
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