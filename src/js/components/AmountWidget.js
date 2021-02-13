import {select, settings} from './settings.js';

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

export default AmountWidget;
