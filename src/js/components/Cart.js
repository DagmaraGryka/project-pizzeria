import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(thisCart.product of thisCart.products){
      thisCart.totalNumber += thisCart.product.amount;
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

    for(let price of thisCart.dom.totalPrice){
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

export default Cart;
