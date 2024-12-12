import * as THREE from 'three';
import { textureLogger } from '../../utils/textureLogger';
import { MaterialData } from '../../types/scene.types';

export class MaterialScanner {
  scanMaterials(scene: THREE.Scene, textureMap: Map<string, string>) {
    console.group('📦 Scanning GLB materials and textures');
    
    let materialCount = 0;
    let textureCount = 0;
    const materials = new Map<string, MaterialData>();

    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        materialCount++;
        const material = Array.isArray(node.material) 
          ? node.material[0] 
          : node.material;
        
        if (material) {
          // Log material type for debugging
          console.log(`Material type for ${node.name}:`, material.type);
          console.log('Material properties:', {
            color: material.color?.getHexString(),
            map: material.map?.uuid,
            normalMap: material.normalMap?.uuid,
            roughnessMap: material.roughnessMap?.uuid,
            metalnessMap: material.metalnessMap?.uuid
          });

          const materialData = this.extractMaterialData(material, textureMap);
          materials.set(material.uuid, materialData);
          
          // Count valid textures
          textureCount += Object.entries(materialData)
            .filter(([key, value]) => key.includes('Map') && value)
            .length;

          console.log(`📦 Material found on mesh: ${node.name}`, materialData);
        }
      }
    });

    console.log(`📊 Summary: Found ${materialCount} materials with ${textureCount} textures`);
    console.groupEnd();

    return materials;
  }

  extractMaterialData(material: THREE.Material, textureMap: Map<string, string>): MaterialData {
    // Support both MeshStandardMaterial and MeshBasicMaterial
    const isMeshStandard = material instanceof THREE.MeshStandardMaterial;
    const isMeshBasic = material instanceof THREE.MeshBasicMaterial;

    if (!isMeshStandard && !isMeshBasic) {
      console.warn(`Non-standard material type found: ${material.type}`);
    }

    const materialData: MaterialData = {
      color: '#' + (material.color ? material.color.getHexString() : 'cccccc')
    };

    // Add PBR properties if available
    if (isMeshStandard) {
      const standardMat = material as THREE.MeshStandardMaterial;
      materialData.metalness = standardMat.metalness;
      materialData.roughness = standardMat.roughness;

      // Extract texture maps
      const maps = {
        map: standardMat.map,
        normalMap: standardMat.normalMap,
        roughnessMap: standardMat.roughnessMap,
        metalnessMap: standardMat.metalnessMap,
        aoMap: standardMat.aoMap,
        emissiveMap: standardMat.emissiveMap
      };

      // Process each texture
      for (const [mapType, texture] of Object.entries(maps)) {
        if (texture) {
          const textureData = textureMap.get(texture.uuid);
          if (textureData) {
            materialData[mapType as keyof MaterialData] = textureData;
            console.log(`✅ Found ${mapType} texture for material ${material.uuid}`);
          } else {
            console.warn(`⚠️ Missing texture data for ${mapType} on material ${material.uuid}`);
          }
        }
      }
    } else if (isMeshBasic) {
      // Handle basic material textures
      const basicMat = material as THREE.MeshBasicMaterial;
      if (basicMat.map) {
        const textureData = textureMap.get(basicMat.map.uuid);
        if (textureData) {
          materialData.map = textureData;
          console.log(`✅ Found base texture for basic material ${material.uuid}`);
        }
      }
    }

    // Log material details
    console.group(`🎨 Material Details: ${material.uuid}`);
    console.log('Type:', material.type);
    console.log('Color:', materialData.color);
    console.log('Metalness:', materialData.metalness);
    console.log('Roughness:', materialData.roughness);
    console.log('Maps:', Object.entries(materialData)
      .filter(([key]) => key.includes('Map'))
      .map(([key, value]) => `${key}: ${value ? '✅' : '❌'}`));
    console.groupEnd();

    return materialData;
  }
}