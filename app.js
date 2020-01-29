// variables based on CSS classes, using querySelector

const cartButton = document.querySelector('.cart-btn');
const closeCartButton = document.querySelector('.close-cart');
const clearCartButton = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

// cart that we will work with
let cart = [];
//buttons
let buttonsDOM = [];

// get products locally
class Products {
	async getProducts() {
		try {
			let result = await fetch('products.json');
			let data = await result.json();
			let products = data.items;
			// mapping is for future use when local storage will be replaced by contentful
			products = products.map((item) => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch (error) {
			console.error();
		}
	}
}

// ui - display products
class DisplayProducts {
	displayProducts(products) {
		let result = '';
		products.forEach((product) => {
			result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `;
		});
		productDOM.innerHTML = result;
	}

	getCartButtons() {
		const btns = [ ...document.querySelectorAll('.bag-btn') ];
		buttonsDOM = btns;
		btns.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);
			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			}
			button.addEventListener('click', (event) => {
				event.target.innerText = 'In Cart';
				event.target.disabled = true;
				let cartItem = { ...LocalStorage.getProduct(id), amount: 1 };
				//add product to the cart
				cart = [ ...cart, cartItem ];
				LocalStorage.saveCart(cart);
				//save cart value
				this.setCartValues(cart);
				this.addCartItem(cartItem);
				//show the cart
				this.showCart();
			});
		});
	}
	setCartValues(cart) {
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map((item) => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}

	addCartItem(item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
		cartContent.appendChild(div);
	}

	showCart() {
		cartDOM.classList.add('showCart');
		cartOverlay.classList.add('transparentBcg');
	}
	hideCart() {
		cartDOM.classList.remove('showCart');
		cartOverlay.classList.remove('transparentBcg');
	}

	setupAPP() {
		cart = LocalStorage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartButton.addEventListener('click', this.showCart);
		closeCartButton.addEventListener('click', this.hideCart);
	}

	populateCart(cart) {
		cart.forEach((item) => this.addCartItem(item));
	}
}

// local storage
class LocalStorage {
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products));
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find((product) => product.id === id);
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	static getCart() {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const display = new DisplayProducts();
	const products = new Products();

	//setup App
	display.setupAPP();

	//get all products from local storage
	products
		.getProducts()
		.then((products) => {
			display.displayProducts(products);
			LocalStorage.saveProducts(products);
		})
		.then(() => {
			display.getCartButtons();
		});
});
