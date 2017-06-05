'use strict';

window.onfocus = function(){ document.body.className = 'focused'; };
window.onblur = function(){ document.body.className = 'blurred'; };

var icons = require('./icons');

/**
 * Custom element: n-icon
 */

class NIcon extends HTMLElement {

  constructor() {
    super(); 
    this.icon = this.innerText;
    this.size = this.getAttribute('size');
  }

  connectedCallback() {
  	if (icons[this.icon]) this.innerHTML = `${icons[this.icon]}`;
  }
};

window.customElements.define('n-icon', NIcon);




