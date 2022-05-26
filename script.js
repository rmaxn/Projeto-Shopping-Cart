const URL = 'https://api.mercadolibre.com/sites/MLB/search?q=';
const OL = document.getElementsByClassName('cart__items');

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

/*
function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}
*/

const saveToStorage = (ol) => {
  localStorage.setItem('cart', JSON.stringify(ol.innerHTML));
};

function cartItemClickListener(event) {
  event.target.remove();
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

const fetchProduct = (id) => {
  const item = `https://api.mercadolibre.com/items/${id}`;
  const getInfos = fetch(item);
  getInfos.then((response) => {
    response.json().then((data) => {
      OL[0].appendChild(createCartItemElement(data));
      saveToStorage(OL[0]);
    });
  });
};

const addToCart = () => {
  const buttonsNode = [...document.getElementsByClassName('item__add')];
  buttonsNode.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.parentElement.firstChild.innerText;
      fetchProduct(id);
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

const buscarProdutos = (url) => {
  const callback = (resolve, reject) => {
    const listProducts = fetch(url);
    listProducts.then(function (response) {
      if (!response.ok) throw new Error(`Erro${response.status}`);
      return response.json();
    })
    .then((data) => {
      mapProductsToFunctions(data);
      addToCart();
    })
    .then(resolve)
    .catch(reject);
  };
  return new Promise(callback);
};

const getFromStorage = () => {
  const li = JSON.parse(localStorage.getItem('cart'));
  OL[0].innerHTML = li;
};

window.onload = function onload() {
  buscarProdutos(`${URL}computador`);
  getFromStorage();
};
