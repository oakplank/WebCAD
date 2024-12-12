import * as THREE from 'three';

export async function textureToDataUrl(texture: THREE.Texture): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    const image = texture.image;
    
    if (!image) return null;

    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to convert texture to data URL:', error);
    return null;
  }
}

export function createMaterialWithTextures(
  material: THREE.Material,
  textures: Record<string, string | undefined>
): THREE.Material {
  if (!(material instanceof THREE.MeshStandardMaterial)) return material;

  const loadTexture = (dataUrl: string | undefined) => {
    if (!dataUrl) return null;
    const texture = new THREE.TextureLoader().load(dataUrl);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  };

  material.map = loadTexture(textures.map) || null;
  material.normalMap = loadTexture(textures.normalMap) || null;
  material.roughnessMap = loadTexture(textures.roughnessMap) || null;
  material.metalnessMap = loadTexture(textures.metalnessMap) || null;
  material.alphaMap = loadTexture(textures.alphaMap) || null;
  material.aoMap = loadTexture(textures.aoMap) || null;
  material.emissiveMap = loadTexture(textures.emissiveMap) || null;
  material.envMap = loadTexture(textures.envMap) || null;

  return material;
}