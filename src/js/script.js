/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmountWidget();
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
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
        //console.log(activeProducts);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for(let activeProduct of activeProducts){ // petla do zwijania/rozwijania
          if (activeProduct !== thisProduct.element)
            activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });

    } // wywolana w constructor

    initOrderForm(){ //będzie uruchamiana tylko raz dla każdego produktu
      const thisProduct = this;
      //console.log(this.initOrderForm);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    } // wywolanie w constructor

    processOrder(){
      const thisProduct = this;
      //console.log(this.processOrder);

      const formData = utils.serializeFormToObject(thisProduct.form); //Odczytywanie wartości z formularza
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelect = formData[paramId] && formData[paramId].includes(optionId);
          //console.log(optionSelect);

          if(optionSelect){
            if(option.default !== true){ //// check if the option is not default
              price = price + option.price; // add option price to price variable
            }
          } else {
            if (option.default == true){ // check if the option is default
              price = price - option.price; // reduce price variable
            }
          }


          // znajdz obrazki z klasa .paramId-optionId
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(optionImage);

          if(optionImage !== null) {
            if(optionSelect){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price,
      //thisProduct.price = price;

      // multiply price by amount
      //price *= thisProduct.amountWidget.value; //??????????
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated',function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){
      const thisProduct = this;

      //const productSummary = {};
      //productSummary.id = thisProduct.id;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value, // poprawione.
        priceSingle: thisProduct.priceSingle, //  thisProduct.data.price,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value, // poprawione
        params: thisProduct.prepareCartProductParams()

      };

      return (productSummary);

    }

    prepareCartProductParams(){
      const thisProduct = this;
      //console.log(this.processOrder);

      const formData = utils.serializeFormToObject(thisProduct.form); //Odczytywanie wartości z formularza
      //console.log('formData', formData);

      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label, //!!!!
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelect = formData[paramId] && formData[paramId].includes(optionId);
          //console.log(optionSelect);

          if(optionSelect){
            //option is selected
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;

    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor elements:', element);

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value); // poprawione
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      //thisWidget.value = settings.amountWidget.defaultValue;

      const newValue = parseInt(value);
      //console.log(newValue);

      //TO DO add validation
      // czy wartość, która przychodzi do funkcji, jest inna niż ta, która jest już aktualnie w thisWidget.value
      // ustalała, czy to wpisano w input jest faktycznie liczbą.
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= 0 && newValue <=10 ){ // PRZYPISAC LICZBY 1 - 10 ??????
        thisWidget.value = newValue;
      }

      //thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;

      thisWidget.announce(); /// miejsce wywolania.
      //console.log(thisWidget.value);

    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(this.value); // tutaj poprawione
      });

      thisWidget.linkDecrease.addEventListener('click',function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce(){
      const thisWidget = this;

      //const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = []; //przechowywać produkty dodane do koszyka

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);

    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);

      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);

      thisCart.dom.form = element.querySelector(select.cart.form); //formularz
      thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click',function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      // tutaj bylo zle. remove- !!!!!!!!!!!!!!!!
      thisCart.dom.productList.addEventListener('remove',function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit',function(event){
        event.preventDefault();

        thisCart.sendOrder();
      });

    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);

      console.log('thisCart.products', menuProduct);

      //thisCart.products.push(menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee; //z informacją o cenie dostawy

      thisCart.totalNumber = 0; //będzie odpowiadała całościowej liczbie sztuk,
      thisCart.subtotalPrice = 0; //zsumowanej cenie za wszystko-bez kosztu dostawy

      for(thisCart.product of thisCart.products){
        thisCart.totalNumber += thisCart.product.amount; //???
        thisCart.subtotalPrice += thisCart.product.price;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      if(thisCart.subtotalPrice > 0 ){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.deliveryFee = 0;
        thisCart.totalPrice = 0;
      }

      //Musimy zadbać to, aby pokazywała je w HTML-u.
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice; //????????

      for(let price of thisCart.dom.totalPrice){ // dlaczego to jest w petli??
        price.innerHTML = thisCart.totalPrice;
      }

      console.log('totalPrice', thisCart.totalPrice);
      console.log('deliveryFee', thisCart.deliveryFee);
      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);

    }

    remove(CartProduct){
      const thisCart = this;

      //Znajdowanie indeksu elementu
      const indexOfProduct = thisCart.products.indexOf(CartProduct);

      //Usuwanie elementu- dwa argumenty/ indeks pierwszego usuwanego elementu
      // i liczbę elementów, licząc od pierwszego usuwanego elementu
      thisCart.products.splice(indexOfProduct, 1);

      //Usunięcie elementu z DOM/ wykonanej na elemencie, który ma zostać usunięty
      CartProduct.dom.wrapper.remove();

      thisCart.update();

      console.log(thisCart.products);

    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order; //http://localhost:3131/order

      const payload = { //często określa się dane, które będą wysłane do serwera.
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []
      };

      console.log('payload', payload);

      for(let prod of thisCart.products){
        payload.products.push(prod.getData()); //Dodajemy tylko obiekty podsumowania.
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);

      /*fetch(url, options)
        .then(function(response) {
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
      */

    }
  }

  class CartProduct {
    constructor(menuProduct, element){ //referencję do obiektu podsumowania, referencję do utworzonego dla tego produktu elementu HTML-u
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log('CartProduct', thisCartProduct);

    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    initAmountWidget(){ //???????? value 1.
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated',function(){ //aktualizuje wartosc ceny
        //WYSWIETLA SIE 1 value
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: { //Możemy w niej przekazać dowolne informacje do handlera eventu
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();

        thisCartProduct.remove();
      });

      console.log('remove', thisCartProduct.dom.remove);

    }

    getData(){ //będą potrzebne w momencie zapisywania zamówienia,
      const thisCartProduct = this;

      const formProduct = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };

      return formProduct;
    }

  }


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
    }
  };

  app.init();
}
