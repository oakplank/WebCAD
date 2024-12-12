// GLBLoader.ts

import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SceneObject } from '../../types/scene.types';
import { textureLogger } from '../../utils/textureLogger';
import { MaterialScanner } from './MaterialScanner';

export class GLBLoader {
  private loader: GLTFLoader;
  private materialScanner: MaterialScanner;

  constructor() {
    this.loader = new GLTFLoader();
    this.materialScanner = new MaterialScanner();
  }

  async importGLB(file: File): Promise<{ objects: SceneObject[] }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);

      this.loader.load(
        url,
        async (gltf: GLTF) => {
          try {
            // Extract textures before processing materials
            const textureMap = await this.extractTexturesFromGLTF(gltf);
            
            // Scan and log materials with extracted textures
            this.materialScanner.scanMaterials(gltf.scene, textureMap);
            
            // Process scene into objects
            const objects = this.processScene(gltf.scene, textureMap);
            
            // Print texture loading summary
            textureLogger.printSummary();
            
            resolve({ objects });
          } catch (error) {
            console.error('Error processing GLB:', error);
            reject(error);
          } finally {
            URL.revokeObjectURL(url);
          }
        },
        (progress) => {
          if (progress.total) { // Avoid division by zero
            console.log('Loading progress:', ((progress.loaded / progress.total) * 100).toFixed(2) + '%');
          } else {
            console.log('Loading progress:', progress.loaded);
          }
        },
        (error) => {
          console.error('GLB loading error:', error);
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  }

  // Ensure this method is inside the GLBLoader class
  private async extractTexturesFromGLTF(gltf: GLTF): Promise<Map<string, string>> {
    const textureMap = new Map<string, string>();
    const processedTextures = new Set<THREE.Texture>();
    const texturePromises: Promise<void>[] = [];

    console.group('🔍 Extracting textures from GLTF');
    
    const processTexture = async (texture: THREE.Texture | null, type: string) => {
      if (!texture || processedTextures.has(texture)) return;
      
      processedTextures.add(texture);
      
      try {
        // Handle different types of texture sources
        if (texture.image) {
          let dataUrl: string | null = null;

          if (texture.image instanceof HTMLImageElement) {
            // Wait for image to load if not already loaded
            if (!texture.image.complete) {
              await new Promise<void>((resolve, reject) => {
                texture.image.onload = () => resolve();
                texture.image.onerror = () => reject(new Error(`Failed to load image for texture: ${type}`));
              });
            }

            // Convert image to data URL
            const canvas = document.createElement('canvas');
            canvas.width = texture.image.width;
            canvas.height = texture.image.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(texture.image, 0, 0);
              dataUrl = canvas.toDataURL('image/png');
            }
          } else if ('data' in texture.image && texture.image.data) {
            // Handle binary data
            const blob = new Blob([texture.image.data], { type: 'image/png' });
            dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error(`Failed to read binary data for texture: ${type}`));
              reader.readAsDataURL(blob);
            });
          }

          if (dataUrl) {
            const textureId = texture.uuid;
            textureMap.set(textureId, dataUrl);
            console.log(`✅ Extracted ${type} texture: ${textureId}`);
          }
        }
      } catch (error) {
        console.error(`Failed to extract ${type} texture:`, error);
      }
    };

    // Traverse the scene and collect texture processing promises
    gltf.scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        
        materials.forEach(material => {
          if (material) {
            // Log material type for debugging
            console.log(`Processing material type: ${material.type} for mesh: ${node.name}`);
            
            const promises: Promise<void>[] = [];
            if ('map' in material && material.map) promises.push(processTexture(material.map, 'base color'));
            if ('normalMap' in material && material.normalMap) promises.push(processTexture(material.normalMap, 'normal'));
            if ('roughnessMap' in material && material.roughnessMap) promises.push(processTexture(material.roughnessMap, 'roughness'));
            if ('metalnessMap' in material && material.metalnessMap) promises.push(processTexture(material.metalnessMap, 'metalness'));
            if ('aoMap' in material && material.aoMap) promises.push(processTexture(material.aoMap, 'ambient occlusion'));
            if ('emissiveMap' in material && material.emissiveMap) promises.push(processTexture(material.emissiveMap, 'emissive'));
            
            texturePromises.push(...promises);
          }
        });
      }
    });

    // Wait for all texture processing to complete
    await Promise.all(texturePromises);

    console.log(`📊 Extracted ${textureMap.size} unique textures`);
    console.groupEnd();

    return textureMap;
  }

  private processScene(scene: THREE.Scene, textureMap: Map<string, string>): SceneObject[] {
    const objects: SceneObject[] = [];
    
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const object = this.convertMeshToObject(node, textureMap);
        if (object) {
          objects.push(object);
        }
      }
    });

    return objects;
  }

  private convertMeshToObject(mesh: THREE.Mesh, textureMap: Map<string, string>): SceneObject | null {
    try {
      // Get world transform
      mesh.updateMatrixWorld(true);
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      mesh.matrixWorld.decompose(position, quaternion, scale);

      // Extract Euler rotation from quaternion
      const euler = new THREE.Euler().setFromQuaternion(quaternion);

      // Extract material data with texture references
      const material = this.materialScanner.extractMaterialData(mesh.material, textureMap);

      return {
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
    } catch (error) {
      console.error('Failed to convert mesh to object:', error);
      return null;
    }
  }

  private extractGeometryData(geometry: THREE.BufferGeometry) {
    return {
      vertices: Array.from(geometry.attributes.position.array),
      indices: geometry.index ? Array.from(geometry.index.array) : [],
      normals: geometry.attributes.normal ? Array.from(geometry.attributes.normal.array) : [],
      uvs: geometry.attributes.uv ? Array.from(geometry.attributes.uv.array) : []
    };
  }
}
