import * as THREE from 'three';
import { MaterialData } from '../../types/scene.types';

export class MaterialScanner {
  private async createImageBitmapURL(bitmap: ImageBitmap): Promise<string> {
    // Create a canvas and draw the ImageBitmap to it
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    
    // Draw the bitmap to the canvas
    ctx.drawImage(bitmap, 0, 0);
    
    // Convert to data URL
    return canvas.toDataURL('image/png');
  }

  async extractMaterialData(material: THREE.Material): Promise<MaterialData> {
    console.group(`🔍 Processing material: ${material.uuid}`);
    console.log('Material type:', material.type);

    // Support both MeshStandardMaterial and MeshBasicMaterial
    const isMeshStandard = material instanceof THREE.MeshStandardMaterial;
    const isMeshBasic = material instanceof THREE.MeshBasicMaterial;

    if (!isMeshStandard && !isMeshBasic) {
      console.warn(`⚠️ Non-standard material type found: ${material.type}`);
    }

    const materialData: MaterialData = {
      color: '#' + (material.color ? material.color.getHexString() : 'cccccc')
    };
    console.log('Base color:', materialData.color);

    // Add PBR properties if available
    if (isMeshStandard) {
      console.log('Processing Standard Material');
      const standardMat = material as THREE.MeshStandardMaterial;
      materialData.metalness = standardMat.metalness;
      materialData.roughness = standardMat.roughness;
      console.log('PBR properties:', { metalness: materialData.metalness, roughness: materialData.roughness });

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
        console.group(`Processing ${mapType}`);
        if (texture) {
          console.log('Texture found:', texture.uuid);
          if (texture.image) {
            console.log('Image data present');
            try {
              // Get the image source directly
              const imgSource = texture.source;
              console.log('Source type:', imgSource?.constructor.name);
              
              if (imgSource && imgSource.data) {
                console.log('Source data type:', imgSource.data?.constructor.name);
                let textureUrl: string | undefined;
                
                // Handle different types of texture sources
                if (imgSource.data instanceof HTMLImageElement) {
                  textureUrl = imgSource.data.src;
                  console.log('HTMLImageElement source:', textureUrl);
                } else if (imgSource.data instanceof HTMLCanvasElement) {
                  textureUrl = imgSource.data.toDataURL();
                  console.log('Canvas source converted to data URL');
                } else if (imgSource.data instanceof ImageBitmap) {
                  textureUrl = await this.createImageBitmapURL(imgSource.data);
                  console.log('ImageBitmap converted to data URL');
                } else if ('data' in imgSource.data && imgSource.data.data) {
                  const blob = new Blob([imgSource.data.data], { type: 'image/png' });
                  textureUrl = URL.createObjectURL(blob);
                  console.log('Binary data converted to blob URL:', textureUrl);
                }

                if (textureUrl) {
                  materialData[mapType as keyof MaterialData] = textureUrl;
                  console.log(`✅ Successfully processed ${mapType} texture`);
                } else {
                  console.warn(`⚠️ Could not generate URL for ${mapType} texture`);
                }
              } else {
                console.warn('⚠️ No valid source data found');
              }
            } catch (error) {
              console.error(`❌ Failed to process ${mapType} texture:`, error);
            }
          } else {
            console.warn('⚠️ Texture has no image data');
          }
        } else {
          console.log(`${mapType} not present`);
        }
        console.groupEnd();
      }
    } else if (isMeshBasic) {
      console.log('Processing Basic Material');
      // Handle basic material textures
      const basicMat = material as THREE.MeshBasicMaterial;
      if (basicMat.map) {
        console.group('Processing base texture');
        console.log('Texture found:', basicMat.map.uuid);
        if (basicMat.map.image) {
          console.log('Image data present');
          try {
            const imgSource = basicMat.map.source;
            console.log('Source type:', imgSource?.constructor.name);
            
            if (imgSource && imgSource.data) {
              console.log('Source data type:', imgSource.data?.constructor.name);
              let textureUrl: string | undefined;
              
              if (imgSource.data instanceof HTMLImageElement) {
                textureUrl = imgSource.data.src;
                console.log('HTMLImageElement source:', textureUrl);
              } else if (imgSource.data instanceof HTMLCanvasElement) {
                textureUrl = imgSource.data.toDataURL();
                console.log('Canvas source converted to data URL');
              } else if (imgSource.data instanceof ImageBitmap) {
                textureUrl = await this.createImageBitmapURL(imgSource.data);
                console.log('ImageBitmap converted to data URL');
              } else if ('data' in imgSource.data && imgSource.data.data) {
                const blob = new Blob([imgSource.data.data], { type: 'image/png' });
                textureUrl = URL.createObjectURL(blob);
                console.log('Binary data converted to blob URL:', textureUrl);
              }

              if (textureUrl) {
                materialData.map = textureUrl;
                console.log('✅ Successfully processed base texture');
              } else {
                console.warn('⚠️ Could not generate URL for base texture');
              }
            } else {
              console.warn('⚠️ No valid source data found');
            }
          } catch (error) {
            console.error('❌ Failed to process base texture:', error);
          }
        } else {
          console.warn('⚠️ Texture has no image data');
        }
        console.groupEnd();
      } else {
        console.log('No base texture present');
      }
    }

    console.log('Final material data:', materialData);
    console.groupEnd();
    return materialData;
  }
}