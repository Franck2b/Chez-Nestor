import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Drink } from './entities/drink.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DrinksService implements OnModuleInit {
  private readonly filename = 'drinks.json';
  private drinks: Drink[] = [];

  constructor(private readonly storageService: StorageService) {}

  async onModuleInit() {
    const initialData: Drink[] = [
      {
        id: 1,
        name: 'Coca-Cola',
        price: 3.5,
        size: '33cl',
        withAlcohol: false,
        available: true,
      },
      {
        id: 2,
        name: 'Bière',
        price: 4.5,
        size: '33cl',
        withAlcohol: true,
        available: true,
      },
      {
        id: 3,
        name: 'Eau minérale',
        price: 2.5,
        size: '50cl',
        withAlcohol: false,
        available: true,
      },
    ];
    await this.storageService.initializeFile(this.filename, initialData);
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.drinks = await this.storageService.readFile<Drink>(this.filename);
  }

  private async saveData(): Promise<void> {
    await this.storageService.writeFile(this.filename, this.drinks);
  }

  private getNextId(): number {
    return this.drinks.length > 0
      ? Math.max(...this.drinks.map((d) => d.id)) + 1
      : 1;
  }

  async findAll(): Promise<Drink[]> {
    await this.loadData();
    return this.drinks;
  }

  async findOne(id: number): Promise<Drink> {
    await this.loadData();
    const drink = this.drinks.find((d) => d.id === id);
    if (!drink) {
      throw new NotFoundException(`Boisson avec l'id ${id} introuvable`);
    }
    return drink;
  }

  async create(drinkData: Omit<Drink, 'id'>): Promise<Drink> {
    await this.loadData();
    const newDrink: Drink = {
      id: this.getNextId(),
      ...drinkData,
    };
    this.drinks.push(newDrink);
    await this.saveData();
    return newDrink;
  }

  async update(id: number, drinkData: Omit<Drink, 'id'>): Promise<Drink> {
    await this.loadData();
    const drinkIndex = this.drinks.findIndex((d) => d.id === id);
    if (drinkIndex === -1) {
      throw new NotFoundException(`Boisson avec l'id ${id} introuvable`);
    }
    this.drinks[drinkIndex] = {
      id,
      ...drinkData,
    };
    await this.saveData();
    return this.drinks[drinkIndex];
  }

  async remove(id: number): Promise<void> {
    await this.loadData();
    const drinkIndex = this.drinks.findIndex((d) => d.id === id);
    if (drinkIndex === -1) {
      throw new NotFoundException(`Boisson avec l'id ${id} introuvable`);
    }
    this.drinks.splice(drinkIndex, 1);
    await this.saveData();
  }

  async findByIds(ids: number[]): Promise<Drink[]> {
    await this.loadData();
    return ids.map((id) => this.drinks.find((d) => d.id === id)).filter(Boolean) as Drink[];
  }
}
