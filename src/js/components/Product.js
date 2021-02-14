import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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

    //app.cart.add(thisProduct.prepareCartProduct());

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
