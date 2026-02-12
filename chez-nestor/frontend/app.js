const API_BASE_URL = 'http://localhost:3000';

let pizzas = [];
let drinks = [];
let desserts = [];
let cart = [];

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${view}-view`).classList.add('active');
        
        if (view === 'orders') {
            loadOrders();
        }
    });
});

document.getElementById('cart-toggle').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.add('open');
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-sidebar').classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
    loadPizzas();
    loadDrinks();
    loadDesserts();
    updateCartUI();
});

async function loadPizzas() {
    try {
        const response = await fetch(`${API_BASE_URL}/pizzas`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        pizzas = await response.json();
        displayPizzas();
    } catch (error) {
        console.error('Erreur lors du chargement des pizzas:', error);
        document.getElementById('pizzas-list').innerHTML = 
            `<div class="error">⚠️ Impossible de charger les pizzas. Vérifiez que le serveur NestJS est démarré.</div>`;
    }
}

async function loadDrinks() {
    try {
        const response = await fetch(`${API_BASE_URL}/drinks`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        drinks = await response.json();
        displayDrinks();
    } catch (error) {
        console.error('Erreur lors du chargement des boissons:', error);
    }
}

async function loadDesserts() {
    try {
        const response = await fetch(`${API_BASE_URL}/desserts`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        desserts = await response.json();
        displayDesserts();
    } catch (error) {
        console.error('Erreur lors du chargement des desserts:', error);
    }
}

function getPizzaImage(pizzaName) {
    const imageMap = {
        'Margherita': 'margherita.jpg',
        'Pepperoni': 'pepperoni.webp',
        'Quatre Fromages': 'fromages.webp'
    };
    return imageMap[pizzaName] || null;
}

function displayPizzas() {
    const container = document.getElementById('pizzas-list');
    container.innerHTML = pizzas
        .filter(pizza => pizza.available)
        .map(pizza => {
            const imageSrc = getPizzaImage(pizza.name);
            const isHawaiian = pizza.name.toLowerCase().includes('hawaïenne') || pizza.name.toLowerCase().includes('hawai');
            return `
            <div class="menu-item pizza-item ${isHawaiian ? 'hawaiian-pizza' : ''}" data-type="pizza" data-id="${pizza.id}">
                ${imageSrc ? `<div class="pizza-preview"><img src="${imageSrc}" alt="${pizza.name}"></div>` : ''}
                ${isHawaiian ? '<div class="pizza-warning">TES FOU PREND PAS CA</div>' : ''}
                <h3>${pizza.name}</h3>
                <div class="price">${pizza.price.toFixed(2)} €</div>
                <div class="description">${pizza.ingredients.join(', ')}</div>
                <div class="quantity-control" style="display: none;">
                    <button class="quantity-btn" onclick="decreaseQuantity('pizza', ${pizza.id})">-</button>
                    <span class="quantity-display" id="qty-pizza-${pizza.id}">0</span>
                    <button class="quantity-btn" onclick="increaseQuantity('pizza', ${pizza.id})">+</button>
                </div>
                <button class="add-btn" onclick="addToCart('pizza', ${pizza.id})">
                    Ajouter
                </button>
            </div>
        `;
        }).join('');
}

function displayDrinks() {
    const container = document.getElementById('drinks-list');
    container.innerHTML = drinks
        .filter(drink => drink.available)
        .map(drink => `
            <div class="menu-item" data-type="drink" data-id="${drink.id}">
                <h3>${drink.name}</h3>
                <div class="price">${drink.price.toFixed(2)} €</div>
                <div class="description">${drink.size} ${drink.withAlcohol ? '🍺' : ''}</div>
                <div class="quantity-control" style="display: none;">
                    <button class="quantity-btn" onclick="decreaseQuantity('drink', ${drink.id})">-</button>
                    <span class="quantity-display" id="qty-drink-${drink.id}">0</span>
                    <button class="quantity-btn" onclick="increaseQuantity('drink', ${drink.id})">+</button>
                </div>
                <button class="add-btn" onclick="addToCart('drink', ${drink.id})">
                    Ajouter
                </button>
            </div>
        `).join('');
}

function displayDesserts() {
    const container = document.getElementById('desserts-list');
    container.innerHTML = desserts
        .filter(dessert => dessert.available)
        .map(dessert => `
            <div class="menu-item" data-type="dessert" data-id="${dessert.id}">
                <h3>${dessert.name}</h3>
                <div class="price">${dessert.price.toFixed(2)} €</div>
                <div class="quantity-control" style="display: none;">
                    <button class="quantity-btn" onclick="decreaseQuantity('dessert', ${dessert.id})">-</button>
                    <span class="quantity-display" id="qty-dessert-${dessert.id}">0</span>
                    <button class="quantity-btn" onclick="increaseQuantity('dessert', ${dessert.id})">+</button>
                </div>
                <button class="add-btn" onclick="addToCart('dessert', ${dessert.id})">
                    Ajouter
                </button>
            </div>
        `).join('');
}

function addToCart(type, id) {
    const item = getItem(type, id);
    if (!item) return;

    if (type === 'dessert' && item.name.toLowerCase().includes('frangipane')) {
        showFrangipanePopup();
    }

    if (type === 'pizza' && (item.name.toLowerCase().includes('hawaïenne') || item.name.toLowerCase().includes('hawai'))) {
        showHawaiianPopup();
        return;
    }

    const existingItem = cart.find(c => c.type === type && c.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ type, id, quantity: 1, item });
    }

    updateCartUI();
    updateQuantityControls(type, id);
}

function increaseQuantity(type, id) {
    const cartItem = cart.find(c => c.type === type && c.id === id);
    if (cartItem) {
        cartItem.quantity++;
        updateCartUI();
        updateQuantityControls(type, id);
    }
}

function decreaseQuantity(type, id) {
    const cartItem = cart.find(c => c.type === type && c.id === id);
    if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(c => !(c.type === type && c.id === id));
        }
        updateCartUI();
        updateQuantityControls(type, id);
    }
}

function removeFromCart(type, id) {
    cart = cart.filter(c => !(c.type === type && c.id === id));
    updateCartUI();
    updateQuantityControls(type, id);
}

function getItem(type, id) {
    const items = { pizza: pizzas, drink: drinks, dessert: desserts };
    return items[type]?.find(item => item.id === id);
}

function updateQuantityControls(type, id) {
    const cartItem = cart.find(c => c.type === type && c.id === id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    const display = document.getElementById(`qty-${type}-${id}`);
    const controls = display?.parentElement;
    const menuItem = display?.closest('.menu-item');
    
    if (display) {
        display.textContent = quantity;
    }
    
    if (controls) {
        controls.style.display = quantity > 0 ? 'flex' : 'none';
    }
    
    if (menuItem) {
        menuItem.classList.toggle('selected', quantity > 0);
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
        checkoutBtn.disabled = true;
        updateCartSummary(0, 0);
        return;
    }
    
    checkoutBtn.disabled = false;
    
    cartItemsContainer.innerHTML = cart.map(cartItem => {
        const item = cartItem.item;
        const typeNames = { pizza: 'Pizza', drink: 'Boisson', dessert: 'Dessert' };
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity('${cartItem.type}', ${cartItem.id})">-</button>
                    <span class="cart-item-quantity">${cartItem.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity('${cartItem.type}', ${cartItem.id})">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart('${cartItem.type}', ${cartItem.id})">×</button>
                </div>
            </div>
        `;
    }).join('');
    
    const pizzasInCart = cart.filter(c => c.type === 'pizza').map(c => ({ id: c.id, item: c.item }));
    const drinksInCart = cart.filter(c => c.type === 'drink').map(c => ({ id: c.id, item: c.item }));
    const dessertsInCart = cart.filter(c => c.type === 'dessert').map(c => ({ id: c.id, item: c.item }));
    
    const subtotal = cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
    
    const hasMenu = pizzasInCart.length > 0 && 
                    drinksInCart.some(d => !d.item.withAlcohol) && 
                    dessertsInCart.length > 0;
    
    let discount = 0;
    if (hasMenu) {
        const firstPizza = pizzasInCart[0]?.item;
        const firstDrink = drinksInCart.find(d => !d.item.withAlcohol)?.item;
        const firstDessert = dessertsInCart[0]?.item;
        
        if (firstPizza && firstDrink && firstDessert) {
            const menuPrice = firstPizza.price + firstDrink.price + firstDessert.price;
            discount = menuPrice * 0.1;
        }
    }
    
    const total = subtotal - discount;
    updateCartSummary(subtotal, discount);
}

function updateCartSummary(subtotal, discount) {
    document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('cart-total').textContent = (subtotal - discount).toFixed(2) + ' €';
    
    const discountRow = document.getElementById('cart-discount');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discount-amount').textContent = '-' + discount.toFixed(2) + ' €';
    } else {
        discountRow.style.display = 'none';
    }
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    const pizzaIds = cart.filter(c => c.type === 'pizza').flatMap(c => Array(c.quantity).fill(c.id));
    const drinkIds = cart.filter(c => c.type === 'drink').flatMap(c => Array(c.quantity).fill(c.id));
    const dessertIds = cart.filter(c => c.type === 'dessert').flatMap(c => Array(c.quantity).fill(c.id));
    
    if (pizzaIds.length === 0) {
        showError('Veuillez sélectionner au moins une pizza');
        return;
    }
    
    try {
        const orderData = {
            pizzas: pizzaIds,
            drinks: drinkIds.length > 0 ? drinkIds : undefined,
            desserts: dessertIds.length > 0 ? dessertIds : undefined
        };
        
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la création de la commande');
        }
        
        const order = await response.json();
        showSuccess(`Commande #${order.id} créée avec succès !`);
        
        cart = [];
        updateCartUI();
        pizzas.forEach(p => updateQuantityControls('pizza', p.id));
        drinks.forEach(d => updateQuantityControls('drink', d.id));
        desserts.forEach(d => updateQuantityControls('dessert', d.id));
        
        document.getElementById('cart-sidebar').classList.remove('open');
        
        if (document.getElementById('orders-view').classList.contains('active')) {
            loadOrders();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError(error.message || 'Erreur lors de la création de la commande');
    }
});

async function loadOrders(filter = 'all') {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        let orders = await response.json();
        
        if (filter === 'pending') {
            orders = orders.filter(o => !o.processed);
        } else if (filter === 'processed') {
            orders = orders.filter(o => o.processed);
        }
        
        displayOrders(orders);
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        document.getElementById('orders-list').innerHTML = '<div class="error">Impossible de charger les commandes</div>';
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadOrders(btn.dataset.filter);
    });
});

function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="loading">Aucune commande</div>';
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const orderPizzas = order.pizzas.map(id => {
            const pizza = pizzas.find(p => p.id === id);
            return pizza ? pizza.name : `Pizza #${id}`;
        }).join(', ') || 'Aucune';
        
        const orderDrinks = order.drinks.map(id => {
            const drink = drinks.find(d => d.id === id);
            return drink ? drink.name : `Boisson #${id}`;
        }).join(', ') || 'Aucune';
        
        const orderDesserts = order.desserts.map(id => {
            const dessert = desserts.find(d => d.id === id);
            return dessert ? dessert.name : `Dessert #${id}`;
        }).join(', ') || 'Aucun';
        
        const hasMenu = order.pizzas.length > 0 && 
                       order.drinks.some(id => {
                           const drink = drinks.find(d => d.id === id);
                           return drink && !drink.withAlcohol;
                       }) && 
                       order.desserts.length > 0;
        
        const theoreticalPrice = order.pizzas.reduce((sum, id) => {
            const pizza = pizzas.find(p => p.id === id);
            return sum + (pizza ? pizza.price : 0);
        }, 0) + order.drinks.reduce((sum, id) => {
            const drink = drinks.find(d => d.id === id);
            return sum + (drink ? drink.price : 0);
        }, 0) + order.desserts.reduce((sum, id) => {
            const dessert = desserts.find(d => d.id === id);
            return sum + (dessert ? dessert.price : 0);
        }, 0);
        
        const discount = theoreticalPrice - order.totalPrice;
        const hasDiscount = discount > 0.01;
        const date = new Date(order.createdAt).toLocaleString('fr-FR');
        
        return `
            <div class="order-card ${order.processed ? 'processed' : ''}">
                <div class="order-header">
                    <div class="order-id">Commande #${order.id}</div>
                    <span class="order-status ${order.processed ? 'processed' : 'pending'}">
                        ${order.processed ? '✓ Terminée' : 'En attente'}
                    </span>
                </div>
                <div class="order-items">
                    <p><strong>Pizzas:</strong> ${orderPizzas}</p>
                    <p><strong>Boissons:</strong> ${orderDrinks}</p>
                    <p><strong>Desserts:</strong> ${orderDesserts}</p>
                </div>
                <div class="order-total">
                    Total: ${order.totalPrice.toFixed(2)} €
                    ${hasDiscount ? `<div class="menu-discount">✨ Réduction menu appliquée (-${discount.toFixed(2)} €)</div>` : ''}
                </div>
                <div class="order-date">Créée le: ${date}</div>
                ${!order.processed ? `
                    <button class="btn-checkout" style="margin-top: 1rem;" onclick="markAsProcessed(${order.id})">
                        Marquer comme terminée
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function markAsProcessed(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/processed`, {
            method: 'PATCH'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        
        showSuccess('Commande marquée comme terminée !');
        loadOrders(document.querySelector('.filter-btn.active').dataset.filter);
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors de la mise à jour de la commande');
    }
}

function showFrangipanePopup() {
    const popup = document.createElement('div');
    popup.className = 'frangipane-popup';
    popup.innerHTML = `
        <div class="frangipane-popup-content">
            <div class="frangipane-emoji">🍰</div>
            <h2>BIEN VU LA FRANGIPANE</h2>
            <p>TU AS BON GOÛT</p>
            <button class="frangipane-close" onclick="this.closest('.frangipane-popup').remove()">✓</button>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 10);
    
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 4000);
}

function showHawaiianPopup() {
    const popup = document.createElement('div');
    popup.className = 'hawaiian-popup';
    popup.innerHTML = `
        <div class="hawaiian-popup-content">
            <div class="hawaiian-emoji">🚫</div>
            <h2>NON DÉSOLÉE</h2>
            <p>TU N'AURAS PAS CETTE PIZZA DE MERDE</p>
            <button class="hawaiian-close" onclick="this.closest('.hawaiian-popup').remove()">×</button>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 10);
    
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 4000);
    }, 4000);
}

function showError(message) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = message;
    document.querySelector('main').insertBefore(div, document.querySelector('main').firstChild);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success';
    div.textContent = message;
    document.querySelector('main').insertBefore(div, document.querySelector('main').firstChild);
    setTimeout(() => div.remove(), 5000);
}
