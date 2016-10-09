
var Neu = (function () {
    var Neu = function (arr) {
        var _this = this, i = 0;
        // Create array-like object
        for (i = 0; i < arr.length; i++) {
            _this[i] = arr[i];
        }
        _this.length = arr.length;
        // Return collection with methods
        return this;
    };
    var $ = function (selector, context) {
        var arr = [], i = 0;
        if (selector && !context) {
            if (selector instanceof Neu) {
                return selector;
            }
        }
        if (selector) {
            // String
            if (typeof selector === 'string') {
                var els, tempParent, html;
                selector = html = selector.trim();
                if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                    var toCreate = 'div';
                    if (html.indexOf('<li') === 0) toCreate = 'ul';
                    if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                    if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                    if (html.indexOf('<tbody') === 0) toCreate = 'table';
                    if (html.indexOf('<option') === 0) toCreate = 'select';
                    tempParent = document.createElement(toCreate);
                    tempParent.innerHTML = html;
                    for (i = 0; i < tempParent.childNodes.length; i++) {
                        arr.push(tempParent.childNodes[i]);
                    }
                }
                else {
                    if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                        // Pure ID selector
                        els = [document.getElementById(selector.split('#')[1])];
                    }
                    else {
                        // Other selectors
                        els = (context || document).querySelectorAll(selector);
                    }
                    for (i = 0; i < els.length; i++) {
                        if (els[i]) arr.push(els[i]);
                    }
                }
            }
            // Node/element
            else if (selector.nodeType || selector === window || selector === document) {
                arr.push(selector);
            }
            //Array of elements or instance of Dom
            else if (selector.length > 0 && selector[0].nodeType) {
                for (i = 0; i < selector.length; i++) {
                    arr.push(selector[i]);
                }
            }
        }
        return new Neu(arr);
    };


    Neu.prototype = {

      addClass: function (className) {
          if (typeof className === 'undefined') {
              return this;
          }
          var classes = className.split(' ');
          for (var i = 0; i < classes.length; i++) {
              for (var j = 0; j < this.length; j++) {
                  if (typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
              }
          }
          return this;
      },

      removeClass: function (className) {
          var classes = className.split(' ');
          for (var i = 0; i < classes.length; i++) {
              for (var j = 0; j < this.length; j++) {
                  if (typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
              }
          }
          return this;
      },
      hasClass: function (className) {
          if (!this[0]) return false;
          else return this[0].classList.contains(className);
      },
      toggleClass: function (className) {
          var classes = className.split(' ');
          for (var i = 0; i < classes.length; i++) {
              for (var j = 0; j < this.length; j++) {
                  if (typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
              }
          }
          return this;
      },
      height: function () {
        if (this[0] === window) {
            return window.innerHeight;
        }
        else {
            if (this.length > 0) {
                return parseFloat(this.css('height'));
            }
            else {
                return null;
            }
        }
      },
      hide: function () {
          for (var i = 0; i < this.length; i++) {
              this[i].style.display = 'none';
          }
          return this;
      },
      show: function () {
          for (var i = 0; i < this.length; i++) {
              this[i].style.display = 'block';
          }
          return this;
      },
      styles: function () {
          var i, styles;
          if (this[0]) return window.getComputedStyle(this[0], null);
          else return undefined;
      },
      each: function (callback) {
          for (var i = 0; i < this.length; i++) {
              callback.call(this[i], i, this[i]);
          }
          return this;
      },
      html: function (html) {
          if (typeof html === 'undefined') {
              return this[0] ? this[0].innerHTML : undefined;
          }
          else {
              for (var i = 0; i < this.length; i++) {
                  this[i].innerHTML = html;
              }
              return this;
          }
      },
      text: function (text) {
          if (typeof text === 'undefined') {
              if (this[0]) {
                  return this[0].textContent.trim();
              }
              else return null;
          }
          else {
              for (var i = 0; i < this.length; i++) {
                  this[i].textContent = text;
              }
              return this;
          }
      },
      append: function (newChild) {
          var i, j;
          for (i = 0; i < this.length; i++) {
              if (typeof newChild === 'string') {
                  var tempDiv = document.createElement('div');
                  tempDiv.innerHTML = newChild;
                  while (tempDiv.firstChild) {
                      this[i].appendChild(tempDiv.firstChild);
                  }
              }
              else if (newChild instanceof Neu) {
                  for (j = 0; j < newChild.length; j++) {
                      this[i].appendChild(newChild[j]);
                  }
              }
              else {
                  this[i].appendChild(newChild);
              }
          }
          return this;
      },
      find : function (selector) {
         var foundElements = [];
         for (var i = 0; i < this.length; i++) {
             var found = this[i].querySelectorAll(selector);
             for (var j = 0; j < found.length; j++) {
                 foundElements.push(found[j]);
             }
         }
         return new Neu(foundElements);
     }
    };
    return $;
})();


var $ = Neu;

window.Neu = Neu;
