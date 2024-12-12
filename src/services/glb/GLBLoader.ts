// GLBLoader.ts

import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { SceneObject } from '../../types/scene.types';
import { MaterialScanner } from './MaterialScanner';

export class GLBLoader {
  private loader: GLTFLoader;
  private materialScanner: MaterialScanner;

  constructor() {
    console.log('🔧 Initializing GLBLoader');
    // Initialize GLTFLoader with DRACO support for better compression
    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // Use DRACO decoder from CDN
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' }); // Use JavaScript decoder for better compatibility
    this.loader.setDRACOLoader(dracoLoader);
    console.log('✅ DRACO decoder configured');
    
    this.materialScanner = new MaterialScanner();
  }

  async importGLB(file: File): Promise<{ objects: SceneObject[] }> {
    console.group(`📦 Importing GLB file: ${file.name}`);
    console.log('File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      console.log('Created blob URL for file');

      this.loader.load(
        url,
        async (gltf: GLTF) => {
          try {
            console.log('GLB file loaded successfully');
            console.group('Scene information');
            console.log('Scenes:', gltf.scenes.length);
            console.log('Animations:', gltf.animations.length);
            console.log('Cameras:', gltf.cameras.length);
            console.log('Asset generator:', gltf.asset?.generator);
            console.log('Asset version:', gltf.asset?.version);
            console.groupEnd();

            // Process scene into objects
            const objects = await this.processScene(gltf.scene);
            console.log(`✅ Processed ${objects.length} objects from scene`);
            
            resolve({ objects });
          } catch (error) {
            console.error('❌ Error processing GLB:', error);
            reject(error);
          } finally {
            URL.revokeObjectURL(url);
            console.log('Cleaned up blob URL');
            console.groupEnd();
          }
        },
        (progress) => {
          if (progress.total) {
            const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
            console.log(`📊 Loading progress: ${percent}%`, {
              loaded: (progress.loaded / 1024 / 1024).toFixed(2) + ' MB',
              total: (progress.total / 1024 / 1024).toFixed(2) + ' MB'
            });
          }
        },
        (error) => {
          console.error('❌ GLB loading error:', error);
          URL.revokeObjectURL(url);
          console.log('Cleaned up blob URL after error');
          console.groupEnd();
          reject(error);
        }
      );
    });
  }

  private async processScene(scene: THREE.Scene): Promise<SceneObject[]> {
    console.group('🔍 Processing scene');
    const objects: SceneObject[] = [];
    
    const meshes = [] as THREE.Mesh[];
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        meshes.push(node);
      }
    });

    for (const mesh of meshes) {
      console.group(`Processing mesh: ${mesh.name || 'unnamed'}`);
      console.log('Geometry:', {
        vertices: mesh.geometry.attributes.position?.count || 0,
        faces: mesh.geometry.index ? mesh.geometry.index.count / 3 : 0
      });
      
      const object = await this.convertMeshToObject(mesh);
      if (object) {
        objects.push(object);
        console.log('✅ Successfully converted mesh to object');
      } else {
        console.warn('⚠️ Failed to convert mesh to object');
      }
      console.groupEnd();
    }

    console.log(`Processed ${objects.length} objects`);
    console.groupEnd();
    return objects;
  }

  private async convertMeshToObject(mesh: THREE.Mesh): Promise<SceneObject | null> {
    try {
      // Get world transform
      mesh.updateMatrixWorld(true);
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      mesh.matrixWorld.decompose(position, quaternion, scale);

      // Extract Euler rotation from quaternion
      const euler = new THREE.Euler().setFromQuaternion(quaternion);

      // Extract material data
      const material = await this.materialScanner.extractMaterialData(mesh.material);

      const object: SceneObject = {
        id: crypto.randomUUID(),
        name: mesh.name || `Part_${Date.now()}`,
        type: 'imported',
        position: [position.x, position.y, position.z],
        rotation: [euler.x, euler.y, euler.z],
        scale: [scale.x, scale.y, scale.z],
        color: material.color,
        visible: true,
        parentId: null,
        children: [],
        geometry: this.extractGeometryData(mesh.geometry),
        material
      };

      console.log('Object data:', {
        id: object.id,
        name: object.name,
        position: object.position,
        rotation: object.rotation,
        scale: object.scale,
        color: object.color
      });

      return object;
    } catch (error) {
      console.error('❌ Failed to convert mesh to object:', error);
      return null;
    }
  }

  private extractGeometryData(geometry: THREE.BufferGeometry) {
    const data = {
      vertices: Array.from(geometry.attributes.position.array),
      indices: geometry.index ? Array.from(geometry.index.array) : [],
      normals: geometry.attributes.normal ? Array.from(geometry.attributes.normal.array) : [],
      uvs: geometry.attributes.uv ? Array.from(geometry.attributes.uv.array) : []
    };

    console.log('Geometry data:', {
      vertexCount: data.vertices.length / 3,
      indexCount: data.indices.length,
      hasNormals: data.normals.length > 0,
      hasUVs: data.uvs.length > 0
    });

    return data;
  }
}
