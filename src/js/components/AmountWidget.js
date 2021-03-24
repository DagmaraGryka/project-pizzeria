import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{ //dziedziczy metody z basewidget
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();

    thisWidget.value = thisWidget.dom.input.value;
  }

  getElements(){
    const thisWidget = this;

    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);

    //thisWidget.dom.input.value = thisWidget.dom.wrapper.querySelector(select.widgets.amount);
  }

  isValid(value){
    return !isNaN(value)
      && value >= 0
      && value <= 10;

  }

  renderValue(){ // zeby wartosc widget wyswietlila sie na stronie
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;

  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click',function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value - 1;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value + 1;
    });
  }




}

export default AmountWidget;
