import {settings,select,classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {

  initBooking: function(){
    const thisApp = this;

    thisApp.bookingContainer = document.querySelector(select.containerOf.booking); //znajdowała kontener widgetu do rezerwacji stron
    new Booking(thisApp.bookingContainer); //tworzyła nową instancję klasy,przekazywała do konstruktora kontener

  },

  initHome: function(){
    const thisApp = this;
    thisApp.homeWrapper = document.querySelector(select.containerOf.home);
    new Home(thisApp.homeWrapper);
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children; //dzieci kontera stron
    thisApp.homeLinks = document.querySelectorAll(select.nav.homeLinks);
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    const navs = [...thisApp.homeLinks, ...thisApp.navLinks ];

    for(let nav of navs){
      nav.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function(pageId){
    const thisApp = this;

    //add class "active" to matching pages, remove from non matching
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    //add class "active" to matching links, remove from non matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }



  },

  initMenu: function(){ //instancje klasy Product // uruchamia sie jako druga
    const thisApp = this; //  korzysta z przygotowanej wcześniej referencji do danych (thisApp.data)

    //console.log('thisApp.data:', thisApp.data);

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
        //console.log('parsedResponse', parsedResponse);

        //save parsedResponse at thisApp.data.products
        thisApp.data.products = parsedResponse;

        //execute initMenu menthod
        thisApp.initMenu();

      });

    console.log('thisApp.data',JSON.stringify(thisApp.data));
  },

  init: function(){ // wywołuje dwie kolejne – initData i initMenu
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initHome();

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();

    thisApp.initBooking();
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
};

app.init();
