/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product', //selektor do naszego szablonu produktu.
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); // czyli tworzyć nasze produkty na stronie.
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      //console.log(menuContainer);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    } // wywolanie w constructor

    initAccordion(){ // rozwijanie/zwijanie
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        console.log(activeProducts);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for(let activeProduct of activeProducts){
          if (activeProduct !== thisProduct.element)
          activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });

    } // wywolana w constructor

    initOrderForm(){
      const thisProduct = this;
      console.log(this.initOrderForm);


    }

    processOrder(){
      const thisProduct = this;
      console.log(this.processOrder);





    }
  }

  const app = {

    initMenu: function(){ //instancje klasy Product // uruchamia sie jako druga
      const thisApp = this; //  korzysta z przygotowanej wcześniej referencji do danych (thisApp.data)

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){ //
        new Product(productData, thisApp.data.products[productData]);
      }
      /*const testProduct = new Product();
      console.log('testProduct:', testProduct);*/
    },

    initData: function(){ //aplikacja korzystała z tego źródła danych data.js
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){ // Ta wywołuje dwie kolejne – initData i initMenu
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
