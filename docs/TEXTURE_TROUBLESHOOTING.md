# GLB Texture Troubleshooting Guide

## File Format Specifications
- Format: GLB (Binary GLTF)
- Version: GLTF 2.0
- Compression: Draco compression not supported in current implementation

## 3D Modeling Software Export Settings

### Blender
1. File > Export > glTF 2.0 (.glb/.gltf)
2. Format: GLB
3. Include:
   - Selected Objects
   - Custom Properties
   - Cameras
   - Punctual Lights
4. Transform:
   - +Y Up
5. Geometry:
   - UVs: ✓
   - Normals: ✓
   - Tangents: ✓
   - Vertex Colors: ✓
6. Materials:
   - Materials: ✓
   - Images: ✓
   - Format: PNG
   - Compression: Disabled

### Maya
1. File > Export Selection
2. Options:
   - Format: GLTF Binary (.glb)
   - Export Colors: ✓
   - Export Textures: ✓
   - Export Normals: ✓
   - Export Skin: ✗
   - Export Animations: ✗
   - Export Blendshapes: ✗

## Current Implementation

### Framework Versions
```json
{
  "@react-three/drei": "^9.92.7",
  "@react-three/fiber": "^8.15.12",
  "three": "^0.159.0"
}
```

### Material/Texture Settings
```typescript
interface MaterialData {
  color: string;
  metalness?: number;
  roughness?: number;
  map?: string;          // Base color texture
  normalMap?: string;    // Normal map
  roughnessMap?: string; // Roughness map
  metalnessMap?: string; // Metalness map
  alphaMap?: string;     // Alpha map
  aoMap?: string;        // Ambient occlusion map
  emissiveMap?: string;  // Emissive map
  envMap?: string;       // Environment map
}
```

### File Structure
```
src/
├── services/
│   ├── FileService.ts       // GLB import/export
│   ├── TextureService.ts    // Texture loading/caching
│   └── MaterialService.ts   // Material management
├── hooks/
│   ├── useMaterial.ts       // Material hook
│   └── useTexture.ts        // Texture loading hook
└── utils/
    └── textureUtils.ts      // Texture utility functions
```

## Common Issues and Solutions

### 1. Textures Not Loading
**Symptoms:**
- Model loads but appears gray/white
- Missing textures in viewport
- Console errors about texture loading

**Solutions:**
1. Check texture paths in exported GLB:
```typescript
// Debug texture paths
gltf.scene.traverse((node) => {
  if (node instanceof THREE.Mesh) {
    const material = node.material as THREE.MeshStandardMaterial;
    console.log('Material maps:', {
      map: material.map?.source?.data?.src,
      normalMap: material.normalMap?.source?.data?.src,
      // ... other maps
    });
  }
});
```

2. Verify texture encoding:
```typescript
// In TextureService.ts
texture.encoding = THREE.sRGBEncoding;  // For color maps
texture.encoding = THREE.LinearEncoding; // For normal maps
```

3. Check UV coordinates:
```typescript
// In ShapeMesh.tsx
if (geometry.attributes.uv) {
  console.log('UV coordinates:', Array.from(geometry.attributes.uv.array));
}
```

### 2. Texture Flickering
**Symptoms:**
- Textures flash between loaded state and gray
- Inconsistent appearance during interaction

**Solutions:**
1. Ensure proper material updates:
```typescript
useEffect(() => {
  if (material instanceof THREE.MeshStandardMaterial) {
    material.needsUpdate = true;
    if (material.map) material.map.needsUpdate = true;
  }
}, [material, textures]);
```

2. Implement texture caching:
```typescript
// In TextureService.ts
private textureCache: Map<string, THREE.Texture> = new Map();

async loadTexture(url: string): Promise<THREE.Texture> {
  if (this.textureCache.has(url)) {
    return this.textureCache.get(url)!;
  }
  // ... load texture
  this.textureCache.set(url, texture);
  return texture;
}
```

### 3. Memory Leaks
**Symptoms:**
- Increasing memory usage
- Performance degradation
- Browser crashes

**Solutions:**
1. Proper cleanup:
```typescript
useEffect(() => {
  return () => {
    material.dispose();
    Object.values(textures).forEach(texture => {
      if (texture) texture.dispose();
    });
  };
}, [material, textures]);
```

2. Cache management:
```typescript
// In TextureService.ts
clearCache() {
  this.textureCache.forEach(texture => texture.dispose());
  this.textureCache.clear();
}
```

## Expected vs Current Results

### Expected
- Textures load immediately with model
- Consistent material appearance
- Proper PBR material rendering
- Memory efficient texture handling

### Current
- Delayed texture loading
- Inconsistent material updates
- Potential memory leaks
- Missing texture cleanup

## Next Steps

1. Implement texture preloading:
```typescript
const preloadTextures = async (gltf: GLTF) => {
  const texturePromises: Promise<void>[] = [];
  gltf.scene.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      const material = node.material as THREE.MeshStandardMaterial;
      if (material.map) {
        texturePromises.push(textureService.loadTexture(material.map.source.data));
      }
    }
  });
  await Promise.all(texturePromises);
};
```

2. Add texture compression support:
```typescript
// TODO: Implement KTX2 texture compression
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
```

3. Improve error handling:
```typescript
// In TextureService.ts
async loadTexture(url: string): Promise<THREE.Texture | null> {
  try {
    // ... loading logic
  } catch (error) {
    console.error(`Failed to load texture: ${url}`, error);
    return null;
  }
}
```

4. Add texture loading progress indicators:
```typescript
// TODO: Implement loading progress UI
onProgress: (event: ProgressEvent) => {
  const progress = (event.loaded / event.total) * 100;
  // Update UI
}
```