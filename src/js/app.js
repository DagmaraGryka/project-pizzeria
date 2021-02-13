import {settings,select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {

initMenu: function(){ //instancje klasy Product // uruchamia sie jako druga
  const thisApp = this; //  korzysta z przygotowanej wcześniej referencji do danych (thisApp.data)

  console.log('thisApp.data:', thisApp.data);

  for(let productData in thisApp.data.products){
    //new Product(productData, thisApp.data.products[productData]);
    new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
  }
  /*const testProduct = new Product();
  console.log('testProduct:', testProduct);*/
},

initData: function(){ //aplikacja korzystała z tego źródła danych data.js
  const thisApp = this;

  //thisApp.data = dataSource;
  thisApp.data = {};

  const url = settings.db.url + '/' + settings.db.product; //http://localhost:3131/product

  fetch(url) //funkcji fetch wysyłamy zapytanie (request) pod podany adres endpointu
    .then(function(rawResponse){ //otrzyma odpowiedź jest w formacie JSON
      return rawResponse.json(); //skonwertuj dane do obiektu JS-owego.
    })

    .then(function(parsedResponse){ //pokaż w konsoli te skonwertowane dane.
      console.log('parsedResponse', parsedResponse);

      //save parsedResponse at thisApp.data.products
      thisApp.data.products = parsedResponse;

      //execute initMenu menthod
      thisApp.initMenu();

    });

  console.log('thisApp.data',JSON.stringify(thisApp.data));
},

init: function(){ // Ta wywołuje dwie kolejne – initData i initMenu
  const thisApp = this;
  console.log('*** App starting ***');
  console.log('thisApp:', thisApp);
  console.log('classNames:', classNames);
  console.log('settings:', settings);
  console.log('templates:', templates);

  thisApp.initData();
  //thisApp.initMenu();
  thisApp.initCart();
},

initCart: function(){ //inicjowała instancję koszyka.
  const thisApp = this;

  const cartElem = document.querySelector(select.containerOf.cart);
  thisApp.cart = new Cart(cartElem);

  thisApp.productList = document.querySelector(select.containerOf.menu);

  thisApp.productList.addEventListener('add-to-cart', function(event){
    app.cart.add(event.detail.product);
  });
},

app.init();
