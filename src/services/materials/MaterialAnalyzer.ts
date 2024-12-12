import * as THREE from 'three';
import { MaterialType, MaterialDefinition } from './MaterialTypes';

export class MaterialAnalyzer {
  analyzeMaterial(material: THREE.Material): MaterialDefinition {
    if (material instanceof THREE.MeshPhysicalMaterial) {
      return this.analyzePhysicalMaterial(material);
    }
    
    if (material instanceof THREE.MeshStandardMaterial) {
      return this.analyzeStandardMaterial(material);
    }

    return this.createDefaultDefinition(material);
  }

  private analyzePhysicalMaterial(material: THREE.MeshPhysicalMaterial): MaterialDefinition {
    if (material.transmission > 0) {
      return {
        type: MaterialType.Subsurface,
        properties: {
          color: '#' + material.color.getHexString(),
          metalness: material.metalness,
          roughness: material.roughness,
          subsurface: {
            strength: material.transmission,
            radius: material.thickness,
            color: '#' + material.attenuationColor.getHexString()
          },
          complexity: 'high',
          gpuCost: 3
        },
        fallback: MaterialType.PBR
      };
    }

    if (material.anisotropy > 0) {
      return {
        type: MaterialType.Anisotropic,
        properties: {
          color: '#' + material.color.getHexString(),
          metalness: material.metalness,
          roughness: material.roughness,
          anisotropic: {
            strength: material.anisotropy,
            rotation: material.anisotropyRotation,
            direction: [1, 0, 0]
          },
          complexity: 'high',
          gpuCost: 2
        },
        fallback: MaterialType.PBR
      };
    }

    if (material.iridescence > 0) {
      return {
        type: MaterialType.Iridescent,
        properties: {
          color: '#' + material.color.getHexString(),
          metalness: material.metalness,
          roughness: material.roughness,
          iridescent: {
            strength: material.iridescence,
            baseColor: '#' + material.color.getHexString(),
            shiftAmount: material.thickness
          },
          complexity: 'high',
          gpuCost: 2
        },
        fallback: MaterialType.PBR
      };
    }

    return this.analyzeStandardMaterial(material);
  }

  private analyzeStandardMaterial(material: THREE.MeshStandardMaterial): MaterialDefinition {
    return {
      type: MaterialType.PBR,
      properties: {
        color: '#' + material.color.getHexString(),
        metalness: material.metalness,
        roughness: material.roughness,
        opacity: material.opacity,
        complexity: 'medium',
        gpuCost: 1
      }
    };
  }

  private createDefaultDefinition(material: THREE.Material): MaterialDefinition {
    return {
      type: MaterialType.Standard,
      properties: {
        color: material instanceof THREE.Material && 'color' in material
          ? '#' + (material.color as THREE.Color).getHexString()
          : '#cccccc',
        complexity: 'low',
        gpuCost: 1
      }
    };
  }
}