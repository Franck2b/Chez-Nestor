import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Dessert } from './entities/dessert.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DessertsService implements OnModuleInit {
  private readonly filename = 'desserts.json';
  private desserts: Dessert[] = [];

  constructor(private readonly storageService: StorageService) {}

  async onModuleInit() {
    const initialData: Dessert[] = [
      {
        id: 1,
        name: 'Tiramisu',
        price: 5.5,
        available: true,
      },
      {
        id: 2,
        name: 'Fondant au chocolat',
        price: 6.0,
        available: true,
      },
      {
        id: 3,
        name: 'Frangipane',
        price: 4.5,
        available: true,
      },
    ];
    await this.storageService.initializeFile(this.filename, initialData);
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.desserts = await this.storageService.readFile<Dessert>(this.filename);
  }

  private async saveData(): Promise<void> {
    await this.storageService.writeFile(this.filename, this.desserts);
  }

  private getNextId(): number {
    return this.desserts.length > 0
      ? Math.max(...this.desserts.map((d) => d.id)) + 1
      : 1;
  }

  async findAll(): Promise<Dessert[]> {
    await this.loadData();
    return this.desserts;
  }

  async findOne(id: number): Promise<Dessert> {
    await this.loadData();
    const dessert = this.desserts.find((d) => d.id === id);
    if (!dessert) {
      throw new NotFoundException(`Dessert avec l'id ${id} introuvable`);
    }
    return dessert;
  }

  async create(dessertData: Omit<Dessert, 'id'>): Promise<Dessert> {
    await this.loadData();
    const newDessert: Dessert = {
      id: this.getNextId(),
      ...dessertData,
    };
    this.desserts.push(newDessert);
    await this.saveData();
    return newDessert;
  }

  async update(id: number, dessertData: Omit<Dessert, 'id'>): Promise<Dessert> {
    await this.loadData();
    const dessertIndex = this.desserts.findIndex((d) => d.id === id);
    if (dessertIndex === -1) {
      throw new NotFoundException(`Dessert avec l'id ${id} introuvable`);
    }
    this.desserts[dessertIndex] = {
      id,
      ...dessertData,
    };
    await this.saveData();
    return this.desserts[dessertIndex];
  }

  async remove(id: number): Promise<void> {
    await this.loadData();
    const dessertIndex = this.desserts.findIndex((d) => d.id === id);
    if (dessertIndex === -1) {
      throw new NotFoundException(`Dessert avec l'id ${id} introuvable`);
    }
    this.desserts.splice(dessertIndex, 1);
    await this.saveData();
  }

  async findByIds(ids: number[]): Promise<Dessert[]> {
    await this.loadData();
    return ids.map((id) => this.desserts.find((d) => d.id === id)).filter(Boolean) as Dessert[];
  }
}
