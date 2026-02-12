import { Injectable } from '@nestjs/common';
import { Pizza } from '../pizzas/entities/pizza.entity';
import { Drink } from '../drinks/entities/drink.entity';
import { Dessert } from '../desserts/entities/dessert.entity';

export interface OrderItems {
  pizzas: Pizza[];
  drinks: Drink[];
  desserts: Dessert[];
}

@Injectable()
export class MenuService {
  /**
   * Calcule le prix total d'une commande avec application de la réduction menu si applicable.
   * Réduction de 10% si la commande contient au moins 1 pizza, 1 boisson sans alcool et 1 dessert.
   */
  calculateTotalPrice(orderItems: OrderItems): number {
    const { pizzas, drinks, desserts } = orderItems;

    const hasPizza = pizzas.length > 0;
    const hasNonAlcoholicDrink = drinks.some((d) => !d.withAlcohol);
    const hasDessert = desserts.length > 0;

    const isMenuEligible = hasPizza && hasNonAlcoholicDrink && hasDessert;

    if (isMenuEligible) {
      const firstPizza = pizzas[0];
      const firstNonAlcoholicDrink = drinks.find((d) => !d.withAlcohol);
      const firstDessert = desserts[0];

      if (!firstNonAlcoholicDrink) {
        throw new Error('Erreur interne : boisson sans alcool introuvable');
      }

      const menuItemsPrice =
        firstPizza.price +
        firstNonAlcoholicDrink.price +
        firstDessert.price;

      const menuDiscount = menuItemsPrice * 0.1;
      const menuItemsPriceWithDiscount = menuItemsPrice - menuDiscount;

      const additionalPizzasPrice = pizzas
        .slice(1)
        .reduce((sum, p) => sum + p.price, 0);
      const alcoholicDrinksPrice = drinks
        .filter((d) => d.withAlcohol)
        .reduce((sum, d) => sum + d.price, 0);
      const additionalNonAlcoholicDrinksPrice = drinks
        .filter((d) => !d.withAlcohol)
        .slice(1)
        .reduce((sum, d) => sum + d.price, 0);
      const additionalDessertsPrice = desserts
        .slice(1)
        .reduce((sum, d) => sum + d.price, 0);

      return (
        menuItemsPriceWithDiscount +
        additionalPizzasPrice +
        alcoholicDrinksPrice +
        additionalNonAlcoholicDrinksPrice +
        additionalDessertsPrice
      );
    }

    const pizzasPrice = pizzas.reduce((sum, p) => sum + p.price, 0);
    const drinksPrice = drinks.reduce((sum, d) => sum + d.price, 0);
    const dessertsPrice = desserts.reduce((sum, d) => sum + d.price, 0);

    return pizzasPrice + drinksPrice + dessertsPrice;
  }
}
