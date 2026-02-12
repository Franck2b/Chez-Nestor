import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { Order } from './entities/order.entity';
import { PizzasService } from '../pizzas/pizzas.service';
import { DrinksService } from '../drinks/drinks.service';
import { DessertsService } from '../desserts/desserts.service';
import { MenuService } from '../menu/menu.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly filename = 'orders.json';
  private orders: Order[] = [];

  constructor(
    private readonly pizzasService: PizzasService,
    private readonly drinksService: DrinksService,
    private readonly dessertsService: DessertsService,
    private readonly menuService: MenuService,
    private readonly storageService: StorageService,
  ) {}

  async onModuleInit() {
    await this.storageService.initializeFile(this.filename, []);
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.orders = await this.storageService.readFile<Order>(this.filename);
  }

  private async saveData(): Promise<void> {
    await this.storageService.writeFile(this.filename, this.orders);
  }

  private getNextId(): number {
    return this.orders.length > 0
      ? Math.max(...this.orders.map((o) => o.id)) + 1
      : 1;
  }

  async findAll(): Promise<Order[]> {
    await this.loadData();
    return this.orders;
  }

  async findOne(id: number): Promise<Order> {
    await this.loadData();
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      throw new NotFoundException(`Commande avec l'id ${id} introuvable`);
    }
    return order;
  }

  async create(orderData: {
    pizzas: number[];
    drinks?: number[];
    desserts?: number[];
  }): Promise<Order> {
    await this.loadData();
    const pizzas = await this.pizzasService.findByIds(orderData.pizzas);
    const drinks = orderData.drinks
      ? await this.drinksService.findByIds(orderData.drinks)
      : [];
    const desserts = orderData.desserts
      ? await this.dessertsService.findByIds(orderData.desserts)
      : [];

    const unavailablePizzas = pizzas.filter((p) => !p.available);
    const unavailableDrinks = drinks.filter((d) => !d.available);
    const unavailableDesserts = desserts.filter((d) => !d.available);

    if (unavailablePizzas.length > 0) {
      throw new BadRequestException(
        `Les pizzas suivantes ne sont pas disponibles: ${unavailablePizzas.map((p) => p.name).join(', ')}`,
      );
    }

    if (unavailableDrinks.length > 0) {
      throw new BadRequestException(
        `Les boissons suivantes ne sont pas disponibles: ${unavailableDrinks.map((d) => d.name).join(', ')}`,
      );
    }

    if (unavailableDesserts.length > 0) {
      throw new BadRequestException(
        `Les desserts suivants ne sont pas disponibles: ${unavailableDesserts.map((d) => d.name).join(', ')}`,
      );
    }

    const totalPrice = this.menuService.calculateTotalPrice({
      pizzas,
      drinks,
      desserts,
    });

    const newOrder: Order = {
      id: this.getNextId(),
      pizzas: orderData.pizzas,
      drinks: orderData.drinks || [],
      desserts: orderData.desserts || [],
      totalPrice,
      processed: false,
      createdAt: new Date(),
    };

    this.orders.push(newOrder);
    await this.saveData();
    return newOrder;
  }

  async update(
    id: number,
    orderData: {
      pizzas?: number[];
      drinks?: number[];
      desserts?: number[];
    },
  ): Promise<Order> {
    await this.loadData();
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Commande avec l'id ${id} introuvable`);
    }

    const currentOrder = this.orders[orderIndex];

    const pizzasIds = orderData.pizzas ?? currentOrder.pizzas;
    const drinksIds = orderData.drinks ?? currentOrder.drinks;
    const dessertsIds = orderData.desserts ?? currentOrder.desserts;

    const pizzas = await this.pizzasService.findByIds(pizzasIds);
    const drinks = drinksIds.length > 0 ? await this.drinksService.findByIds(drinksIds) : [];
    const desserts = dessertsIds.length > 0 ? await this.dessertsService.findByIds(dessertsIds) : [];

    const unavailablePizzas = pizzas.filter((p) => !p.available);
    const unavailableDrinks = drinks.filter((d) => !d.available);
    const unavailableDesserts = desserts.filter((d) => !d.available);

    if (unavailablePizzas.length > 0) {
      throw new BadRequestException(
        `Les pizzas suivantes ne sont pas disponibles: ${unavailablePizzas.map((p) => p.name).join(', ')}`,
      );
    }

    if (unavailableDrinks.length > 0) {
      throw new BadRequestException(
        `Les boissons suivantes ne sont pas disponibles: ${unavailableDrinks.map((d) => d.name).join(', ')}`,
      );
    }

    if (unavailableDesserts.length > 0) {
      throw new BadRequestException(
        `Les desserts suivants ne sont pas disponibles: ${unavailableDesserts.map((d) => d.name).join(', ')}`,
      );
    }

    const totalPrice = this.menuService.calculateTotalPrice({
      pizzas,
      drinks,
      desserts,
    });

    this.orders[orderIndex] = {
      id,
      pizzas: pizzasIds,
      drinks: drinksIds,
      desserts: dessertsIds,
      totalPrice,
      processed: currentOrder.processed,
      createdAt: currentOrder.createdAt,
    };

    await this.saveData();
    return this.orders[orderIndex];
  }

  async remove(id: number): Promise<void> {
    await this.loadData();
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Commande avec l'id ${id} introuvable`);
    }
    this.orders.splice(orderIndex, 1);
    await this.saveData();
  }

  async markAsProcessed(id: number): Promise<Order> {
    await this.loadData();
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Commande avec l'id ${id} introuvable`);
    }
    this.orders[orderIndex].processed = true;
    await this.saveData();
    return this.orders[orderIndex];
  }
}
