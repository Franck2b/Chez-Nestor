import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Pizza } from './entities/pizza.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PizzasService implements OnModuleInit {
  private readonly filename = 'pizzas.json';
  private pizzas: Pizza[] = [];

  constructor(private readonly storageService: StorageService) {}

  async onModuleInit() {
    const initialData: Pizza[] = [
      {
        id: 1,
        name: 'Margherita',
        price: 8.5,
        ingredients: ['Tomate', 'Mozzarella', 'Basilic'],
        available: true,
      },
      {
        id: 2,
        name: 'Pepperoni',
        price: 10.5,
        ingredients: ['Tomate', 'Mozzarella', 'Pepperoni'],
        available: true,
      },
      {
        id: 3,
        name: 'Quatre Fromages',
        price: 11.5,
        ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Chèvre'],
        available: true,
      },
      {
        id: 4,
        name: 'Hawaïenne',
        price: 9.5,
        ingredients: ['Tomate', 'Mozzarella', 'Jambon', 'Ananas'],
        available: true,
      },
    ];
    await this.storageService.initializeFile(this.filename, initialData);
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.pizzas = await this.storageService.readFile<Pizza>(this.filename);
  }

  private async saveData(): Promise<void> {
    await this.storageService.writeFile(this.filename, this.pizzas);
  }

  private getNextId(): number {
    return this.pizzas.length > 0
      ? Math.max(...this.pizzas.map((p) => p.id)) + 1
      : 1;
  }

  async findAll(): Promise<Pizza[]> {
    await this.loadData();
    return this.pizzas;
  }

  async findOne(id: number): Promise<Pizza> {
    await this.loadData();
    const pizza = this.pizzas.find((p) => p.id === id);
    if (!pizza) {
      throw new NotFoundException(`Pizza avec l'id ${id} introuvable`);
    }
    return pizza;
  }

  async create(pizzaData: Omit<Pizza, 'id'>): Promise<Pizza> {
    await this.loadData();
    const newPizza: Pizza = {
      id: this.getNextId(),
      ...pizzaData,
    };
    this.pizzas.push(newPizza);
    await this.saveData();
    return newPizza;
  }

  async update(id: number, pizzaData: Omit<Pizza, 'id'>): Promise<Pizza> {
    await this.loadData();
    const pizzaIndex = this.pizzas.findIndex((p) => p.id === id);
    if (pizzaIndex === -1) {
      throw new NotFoundException(`Pizza avec l'id ${id} introuvable`);
    }
    this.pizzas[pizzaIndex] = {
      id,
      ...pizzaData,
    };
    await this.saveData();
    return this.pizzas[pizzaIndex];
  }

  async remove(id: number): Promise<void> {
    await this.loadData();
    const pizzaIndex = this.pizzas.findIndex((p) => p.id === id);
    if (pizzaIndex === -1) {
      throw new NotFoundException(`Pizza avec l'id ${id} introuvable`);
    }
    this.pizzas.splice(pizzaIndex, 1);
    await this.saveData();
  }

  async findByIds(ids: number[]): Promise<Pizza[]> {
    await this.loadData();
    return ids.map((id) => this.pizzas.find((p) => p.id === id)).filter(Boolean) as Pizza[];
  }
}
