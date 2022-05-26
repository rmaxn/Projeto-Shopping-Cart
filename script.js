const URL = 'https://api.mercadolibre.com/sites/MLB/search?q=';
const OL = document.getElementsByClassName('cart__items');
let CART = [];

async function fetchProduct(id) {
  const item = `https://api.mercadolibre.com/items/${id}`;
  const response = await fetch(item).then((res) => res.json());
  return response;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id, title, thumbnail }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', id));
  section.appendChild(createCustomElement('span', 'item__title', title));
  section.appendChild(createProductImageElement(thumbnail));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const saveToStorage = (ol) => {
  localStorage.setItem('cart', JSON.stringify(ol.innerHTML));
};

function sumCart(cart, value = 0) {
  if (value !== 0) {
    CART.push(value);
  }
  const total = cart.reduce((a, b) => a + b, 0);
  const p = document.getElementsByClassName('total-price');
  p[0].innerText = total;
}

function cartItemClickListener(event) {
  event.target.remove();
  const string = event.target.innerText;
  const arr = string.split('PRICE: $');
  CART.forEach((n, i) => {
    if (n === parseFloat(arr[1])) {
      CART.splice(i, 1);
      sumCart(CART);
    }
  });
  saveToStorage(OL[0]);
}

function createCartItemElement({ id, title, price }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
  li.addEventListener('click', cartItemClickListener);
  if (!saveToStorage(OL[0])) {
    return li;
  }
  return li;
}

const addToCart = () => {
  const buttonsNode = [...document.getElementsByClassName('item__add')];
  buttonsNode.forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.parentElement.firstChild.innerText;
      const response = await fetchProduct(id);
      const { price } = response;
      OL[0].appendChild(createCartItemElement(response));
      saveToStorage(OL[0]);
      sumCart(CART, price);
    });
  });
};

function mapProductsToFunctions({ results }) {
  const SECTION = document.querySelector('.items');
  const data = results.forEach((item) => {
    SECTION.appendChild(createProductItemElement(item));
    createCartItemElement(item);
  });
  return data;
}

async function buscarProdutos(url) {
  const loading = document.querySelector('.loading');
  const response = await fetch(url).then((res) => {
    if (!res) {
      loading.innerText = 'loading...';
    } else {
      loading.remove();
      return res.json();
    }
  });
  mapProductsToFunctions(response);
  addToCart();
  return response;
}

const getFromStorage = () => {
  const li = JSON.parse(localStorage.getItem('cart'));
  OL[0].innerHTML = li;
};

const button = document.getElementsByClassName('empty-cart');

window.onload = function onload() {
  buscarProdutos(`${URL}computador`);
  getFromStorage();
  button[0].addEventListener('click', () => {
    CART = [];
    OL[0].innerHTML = '';
    sumCart(CART);
    saveToStorage(OL[0]);
  });
};
