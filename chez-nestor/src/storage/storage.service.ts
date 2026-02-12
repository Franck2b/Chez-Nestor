import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly dataDir = path.join(process.cwd(), 'data');

  constructor() {
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Erreur lors de la création du dossier data:', error);
    }
  }

  async readFile<T>(filename: string): Promise<T[]> {
    const filePath = path.join(this.dataDir, filename);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeFile<T>(filename: string, data: T[]): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async initializeFile<T>(filename: string, initialData: T[]): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    try {
      await fs.access(filePath);
    } catch {
      await this.writeFile(filename, initialData);
    }
  }
}
