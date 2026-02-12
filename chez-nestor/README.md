# Chez Nest-Or - API de gestion de pizzeria

API REST développée avec NestJS pour la gestion d'une pizzeria : pizzas, boissons, desserts, commandes et menus avec réduction.

## Architecture

Le projet suit une architecture modulaire NestJS organisée par domaine :

```
src/
├── pizzas/          # Module de gestion des pizzas
│   ├── entities/
│   ├── dto/
│   ├── pizzas.controller.ts
│   ├── pizzas.service.ts
│   └── pizzas.module.ts
├── drinks/          # Module de gestion des boissons
│   ├── entities/
│   ├── dto/
│   ├── drinks.controller.ts
│   ├── drinks.service.ts
│   └── drinks.module.ts
├── desserts/        # Module de gestion des desserts
│   ├── entities/
│   ├── dto/
│   ├── desserts.controller.ts
│   ├── desserts.service.ts
│   └── desserts.module.ts
├── orders/          # Module de gestion des commandes
│   ├── entities/
│   ├── dto/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── menu/            # Module de calcul tarifaire (logique métier)
│   ├── menu.service.ts
│   └── menu.module.ts
└── app.module.ts    # Module racine
```

### Principes d'architecture

- **Séparation des responsabilités** : Chaque module gère son propre domaine
- **Logique métier centralisée** : Le calcul des prix avec réduction est dans le module `menu`
- **Validation globale** : Tous les DTOs sont validés automatiquement avec `ValidationPipe`
- **Gestion d'erreurs** : Utilisation des exceptions NestJS (404, 400)
- **Stockage en mémoire** : Toutes les données sont stockées dans des tableaux en mémoire

## Endpoints

### Module Pizzas

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/pizzas` | Liste de toutes les pizzas |
| GET | `/pizzas/:id` | Détail d'une pizza |
| POST | `/pizzas` | Créer une nouvelle pizza |
| PUT | `/pizzas/:id` | Modifier complètement une pizza |
| DELETE | `/pizzas/:id` | Supprimer une pizza |

**Modèle Pizza :**
```typescript
{
  id: number;
  name: string;
  price: number;
  ingredients: string[];
  available: boolean;
}
```

**Validation :**
- `name` : string, minimum 3 caractères
- `price` : number strictement positif (> 0)
- `ingredients` : tableau non vide
- `available` : boolean

### Module Drinks

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/drinks` | Liste de toutes les boissons |
| GET | `/drinks/:id` | Détail d'une boisson |
| POST | `/drinks` | Créer une nouvelle boisson |
| PUT | `/drinks/:id` | Modifier complètement une boisson |
| DELETE | `/drinks/:id` | Supprimer une boisson |

**Modèle Drink :**
```typescript
{
  id: number;
  name: string;
  price: number;
  size: string;
  withAlcohol: boolean;
  available: boolean;
}
```

### Module Desserts

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/desserts` | Liste de tous les desserts |
| GET | `/desserts/:id` | Détail d'un dessert |
| POST | `/desserts` | Créer un nouveau dessert |
| PUT | `/desserts/:id` | Modifier complètement un dessert |
| DELETE | `/desserts/:id` | Supprimer un dessert |

**Modèle Dessert :**
```typescript
{
  id: number;
  name: string;
  price: number;
  available: boolean;
}
```

### Module Orders

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/orders` | Liste de toutes les commandes |
| GET | `/orders/:id` | Détail d'une commande |
| POST | `/orders` | Créer une nouvelle commande |
| PUT | `/orders/:id` | Modifier complètement une commande |
| PATCH | `/orders/:id/processed` | Marquer une commande comme terminée |
| DELETE | `/orders/:id` | Supprimer une commande |

**Modèle Order :**
```typescript
{
  id: number;
  pizzas: number[];
  drinks: number[];
  desserts: number[];
  totalPrice: number;      // Calculé automatiquement
  processed: boolean;
  createdAt: Date;
}
```

**Contraintes métier :**
- Au moins une pizza est requise
- Toutes les ressources référencées doivent exister (404 si inexistante)
- Aucune ressource indisponible (`available: false`) ne peut être commandée (400)
- Le `totalPrice` est calculé automatiquement avec application de la réduction menu si applicable

## Logique du Menu

Le module `menu` contient la logique de calcul tarifaire avec réduction promotionnelle.

### Règle métier

**Réduction de 10% appliquée si la commande contient :**
- Au moins 1 pizza
- Au moins 1 boisson **sans alcool** (`withAlcohol: false`)
- Au moins 1 dessert

### Calcul du prix

1. **Si éligible pour la réduction menu :**
   - La réduction de 10% est appliquée à la somme de :
     - La première pizza
     - La première boisson sans alcool
     - Le premier dessert
   - Les éléments supplémentaires (pizzas, boissons avec alcool, desserts) sont ajoutés au prix total sans réduction

2. **Si non éligible :**
   - Le prix total est la somme de tous les éléments de la commande

**Important :** Les boissons avec alcool (`withAlcohol: true`) ne peuvent pas entrer dans un menu promotionnel.

### Exemple

**Commande éligible :**
- 1 Pizza Margherita (8.50€)
- 1 Coca-Cola (3.50€) - sans alcool
- 1 Tiramisu (5.50€)
- 1 Bière (4.50€) - avec alcool

**Calcul :**
- Menu : (8.50 + 3.50 + 5.50) × 0.90 = 15.75€
- Boisson supplémentaire : 4.50€
- **Total : 20.25€**

## Gestion d'erreurs

L'API utilise les codes HTTP standards :

- **200 OK** : Requête réussie
- **201 Created** : Ressource créée avec succès
- **400 Bad Request** : 
  - Validation des DTOs échouée
  - Ressource indisponible dans une commande
- **404 Not Found** : Ressource inexistante

Les messages d'erreur sont explicites et en français.

## Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run start:dev

# Le serveur démarre sur http://localhost:3000
```

## Technologies utilisées

- **NestJS** : Framework Node.js pour applications serveur
- **class-validator** : Validation des DTOs
- **class-transformer** : Transformation des types
- **TypeScript** : Langage de programmation

## Validation globale

La validation est activée globalement dans `main.ts` avec les options suivantes :

- `whitelist: true` : Supprime les propriétés non définies dans le DTO
- `forbidNonWhitelisted: true` : Rejette les requêtes avec des propriétés non autorisées
- `transform: true` : Transforme automatiquement les types (string → number, etc.)

## Exemples de requêtes

### Créer une commande éligible pour la réduction menu

```bash
POST /orders
Content-Type: application/json

{
  "pizzas": [1],
  "drinks": [1],
  "desserts": [1]
}
```

### Créer une commande sans réduction

```bash
POST /orders
Content-Type: application/json

{
  "pizzas": [1, 2],
  "drinks": [2]
}
```

### Marquer une commande comme terminée

```bash
PATCH /orders/1/processed
```

## Structure des DTOs

Tous les DTOs utilisent `class-validator` pour la validation :

- **CreatePizzaDto** : Validation complète avec messages d'erreur personnalisés
- **CreateDrinkDto** : Validation des champs requis
- **CreateDessertDto** : Validation des champs requis
- **CreateOrderDto** : Validation avec pizzas requis, drinks et desserts optionnels
- **UpdateOrderDto** : Tous les champs optionnels pour modification partielle

## Notes importantes

- Les données sont stockées en mémoire (pas de base de données)
- Les IDs sont générés automatiquement de manière séquentielle
- Le `totalPrice` est toujours calculé automatiquement, jamais fourni par le client
- Le champ `processed` est initialisé à `false` lors de la création d'une commande
- La date de création (`createdAt`) est générée automatiquement
