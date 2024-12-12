import * as THREE from 'three';
import { MaterialType, MaterialDefinition, MaterialProperties } from './MaterialTypes';
import { textureService } from '../TextureService';

export class MaterialConverter {
  private static readonly FALLBACK_CHAIN: Record<MaterialType, MaterialType> = {
    [MaterialType.Subsurface]: MaterialType.PBR,
    [MaterialType.Anisotropic]: MaterialType.PBR,
    [MaterialType.Iridescent]: MaterialType.PBR,
    [MaterialType.PBR]: MaterialType.Standard,
    [MaterialType.Standard]: MaterialType.Standard,
    [MaterialType.Custom]: MaterialType.Standard
  };

  async convertMaterial(definition: MaterialDefinition): Promise<THREE.Material> {
    try {
      const material = await this.createMaterial(definition);
      return material;
    } catch (error) {
      console.warn(`Failed to create ${definition.type} material, falling back`, error);
      return this.createFallbackMaterial(definition);
    }
  }

  private async createMaterial(definition: MaterialDefinition): Promise<THREE.Material> {
    switch (definition.type) {
      case MaterialType.Subsurface:
        return this.createSubsurfaceMaterial(definition.properties);
      case MaterialType.Anisotropic:
        return this.createAnisotropicMaterial(definition.properties);
      case MaterialType.Iridescent:
        return this.createIridescentMaterial(definition.properties);
      case MaterialType.PBR:
        return this.createPBRMaterial(definition.properties);
      default:
        return this.createStandardMaterial(definition.properties);
    }
  }

  private createFallbackMaterial(definition: MaterialDefinition): THREE.Material {
    const fallbackType = definition.fallback || 
                        MaterialConverter.FALLBACK_CHAIN[definition.type];
    
    const fallbackProperties = this.convertProperties(definition.properties, fallbackType);
    
    return new THREE.MeshStandardMaterial({
      color: fallbackProperties.color,
      metalness: fallbackProperties.metalness || 0,
      roughness: fallbackProperties.roughness || 1,
      transparent: fallbackProperties.opacity !== undefined,
      opacity: fallbackProperties.opacity
    });
  }

  private convertProperties(
    properties: MaterialProperties, 
    targetType: MaterialType
  ): MaterialProperties {
    // Convert complex properties to simpler equivalents
    const converted: MaterialProperties = {
      color: properties.color,
      complexity: 'low',
      gpuCost: 1
    };

    if (properties.subsurface) {
      converted.opacity = 0.9;
      converted.roughness = 0.5;
    }

    if (properties.anisotropic) {
      converted.metalness = 0.8;
      converted.roughness = 0.2;
    }

    if (properties.iridescent) {
      converted.metalness = 1;
      converted.roughness = 0.1;
    }

    return converted;
  }

  // Specialized material creation methods
  private async createSubsurfaceMaterial(props: MaterialProperties): Promise<THREE.Material> {
    const material = new THREE.MeshPhysicalMaterial({
      color: props.color,
      metalness: props.metalness || 0,
      roughness: props.roughness || 0.5,
      transmission: props.subsurface?.strength || 0,
      thickness: props.subsurface?.radius || 0,
      attenuationColor: new THREE.Color(props.subsurface?.color || '#ffffff')
    });

    return material;
  }

  private async createAnisotropicMaterial(props: MaterialProperties): Promise<THREE.Material> {
    const material = new THREE.MeshPhysicalMaterial({
      color: props.color,
      metalness: props.metalness || 0.8,
      roughness: props.roughness || 0.2,
      anisotropy: props.anisotropic?.strength || 0,
      anisotropyRotation: props.anisotropic?.rotation || 0
    });

    return material;
  }

  private async createIridescentMaterial(props: MaterialProperties): Promise<THREE.Material> {
    const material = new THREE.MeshPhysicalMaterial({
      color: props.color,
      metalness: 1,
      roughness: 0.1,
      iridescence: props.iridescent?.strength || 0,
      iridescenceIOR: 1.3,
      thickness: props.iridescent?.shiftAmount || 0
    });

    return material;
  }

  private createPBRMaterial(props: MaterialProperties): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: props.color,
      metalness: props.metalness || 0,
      roughness: props.roughness || 1
    });
  }

  private createStandardMaterial(props: MaterialProperties): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: props.color,
      transparent: props.opacity !== undefined,
      opacity: props.opacity
    });
  }
}