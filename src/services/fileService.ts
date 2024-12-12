import { GLBLoader } from './glb/GLBLoader';
import { SceneObject } from '../types/scene.types';

export class FileService {
  private static glbLoader = new GLBLoader();

  static async importFromGLB(file: File): Promise<{ objects: SceneObject[] }> {
    return this.glbLoader.importGLB(file);
  }

  // ... rest of FileService implementation
}