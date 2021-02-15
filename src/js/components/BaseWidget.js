class BaseWidget{ //klasa nadrzedna
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;

  }

  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    //TO DO add validation
    // czy wartość, która przychodzi do funkcji, jest inna niż ta, która jest już aktualnie w  thisWidget.correctValue
    // ustalała, czy to wpisano w input jest faktycznie liczbą.
    if(newValue !=  thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce(); /// miejsce wywolania.
    }

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){ //przeksztalci vlaue na odpowiedni typ
    return parseInt(value);

  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){ // zeby wartosc widget wyswietlila sie na stronie
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML =  thisWidget.value;

  }

  announce(){
    const thisWidget = this;

    //const event = new Event('updated');
    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }

}

export default BaseWidget;
