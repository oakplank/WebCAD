import * as THREE from 'three';
import { MaterialData } from '../types/scene.types';

class MaterialService {
  private materialCache: Map<string, THREE.Material>;

  constructor() {
    this.materialCache = new Map();
  }

  createMaterial(data: MaterialData, viewMode: 'shaded' | 'wireframe' | 'surface'): THREE.Material {
    const cacheKey = this.generateCacheKey(data, viewMode);
    
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    let material: THREE.Material;

    if (viewMode === 'surface') {
      material = new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        transparent: false
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: data.color,
        wireframe: viewMode === 'wireframe',
        metalness: data.metalness ?? 0.5,
        roughness: data.roughness ?? 0.5,
        side: THREE.DoubleSide,
        transparent: false
      });
    }

    this.materialCache.set(cacheKey, material);
    return material;
  }

  updateMaterial(material: THREE.Material, updates: Partial<MaterialData>): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      if (updates.color) material.color.set(updates.color);
      if (updates.metalness !== undefined) material.metalness = updates.metalness;
      if (updates.roughness !== undefined) material.roughness = updates.roughness;
    } else if (material instanceof THREE.MeshBasicMaterial) {
      if (updates.color) material.color.set(updates.color);
    }
  }

  private generateCacheKey(data: MaterialData, viewMode: string): string {
    return `${data.color}-${data.metalness}-${data.roughness}-${viewMode}`;
  }

  clearCache(): void {
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }
}

export const materialService = new MaterialService();