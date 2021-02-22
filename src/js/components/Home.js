import {select, templates } from '../settings.js';
import Carousel from './Carousel.js';

class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.widgets.home.carousel);

    //thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector(select.widgets.home.orderBox);
    //thisHome.dom.bookTableBox = thisHome.dom.wrapper.querySelector(select.widgets.home.bookBox);
    //thisHome.pages = document.querySelector(select.containerOf.pages).children;
    //thisHome.navLinks = document.querySelectorAll(select.nav.links);

    //thisHome.homeWrapper = document.querySelector(select.containerOf.home);

  }

  initCarousel(){
    const thisHome = this;

    thisHome.carousel = new Carousel(thisHome.dom.carousel);
  }

  //kliknięcie w box zachęcający do zamówienia online powinno otwierać podstronę Order
  //(razem z zaznaczeniem odpowiedniego linku w nawigacji jako aktywnego),



}
export default Home;
