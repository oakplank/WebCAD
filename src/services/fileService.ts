import { GLBLoader } from './glb/GLBLoader';
import { SceneObject } from '../types/scene.types';

export class FileService {
  private static glbLoader = new GLBLoader();

  static async importFromGLB(file: File): Promise<{ objects: SceneObject[] }> {
    console.log('📦 Starting GLB import for file:', file.name);
    return this.glbLoader.importGLB(file);
  }

  static async exportToGLB(objects: SceneObject[]): Promise<Blob> {
    // TODO: Implement GLB export
    throw new Error('GLB export not implemented yet');
  }

  static async saveToFile(data: any, filename: string, type: string): Promise<void> {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  static async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  static isGLBFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.glb');
  }

  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  static async validateFileSize(file: File, maxSizeMB: number = 50): Promise<void> {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
    }
  }

  static getMimeType(filename: string): string {
    const extension = this.getFileExtension(filename);
    const mimeTypes: { [key: string]: string } = {
      'glb': 'model/gltf-binary',
      'gltf': 'model/gltf+json',
      'json': 'application/json',
      'obj': 'text/plain',
      'stl': 'model/stl',
      // Add more mime types as needed
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  static async loadImageFromURL(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      
      img.src = url;
    });
  }

  static async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  static dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }
}