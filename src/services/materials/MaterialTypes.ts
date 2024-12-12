import * as THREE from 'three';

// Define supported material types and their properties
export enum MaterialType {
  Standard = 'standard',
  PBR = 'pbr',
  Subsurface = 'subsurface',
  Anisotropic = 'anisotropic',
  Iridescent = 'iridescent',
  Custom = 'custom'
}

export interface MaterialProperties {
  // Base properties
  color: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
  
  // Advanced properties
  subsurface?: {
    strength: number;
    radius: number;
    color: string;
  };
  
  anisotropic?: {
    strength: number;
    rotation: number;
    direction: [number, number, number];
  };
  
  iridescent?: {
    strength: number;
    baseColor: string;
    shiftAmount: number;
  };
  
  // Performance hints
  complexity: 'low' | 'medium' | 'high';
  gpuCost: number;
}

export interface MaterialDefinition {
  type: MaterialType;
  properties: MaterialProperties;
  textures?: Record<string, string>;
  fallback?: MaterialType;
}