(function() {

  var mobileDetect = /Android|iPhone|iPad|iPod|BlackBerry|WPDesktop|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var event = mobileDetect ? 'touchend' : 'mouseup';

  var Tabs = function(opts) {

    this.options = this.extendFn({
      classMain: 'tabs-menu',
      buttons: '.js-tabs-menu__link',
      tabs: '.js-tabs__inner',
      offsetMobile: 70
    }, opts);


    this.triggerActive = false;
    this.tags = {};
    this.tags.xsbuttons = [];
    this.tags.tabs = [];

    this.init();

  }

  Tabs.prototype = {

    init: function() {

      var obj = this;

      this.tags.buttons = document.querySelectorAll(this.options.buttons);

      if(!this.tags.buttons.length) {
        return false;
      }

      this.each(this.tags.buttons, function(index) {

        obj.tags.tabs.push(document.querySelector(this.getAttribute('href')));

        obj.tags.xsbuttons.push(obj.insert('div', {'class': obj.options.classMain + '__xslink'}, this.innerHTML, obj.tags.tabs[index]));

        if(this.classList.contains('active')) {
          obj.tags.tabs[index].classList.add('active');
          obj.tags.xsbuttons[index].classList.add('active');
          obj.triggerActive = true;

          history.pushState(null, null, this.getAttribute('href'));
        }

        this.addEventListener(event, function() {

          obj.each(obj.tags.buttons, function(i) {

            this.classList.remove('active');
            obj.tags.xsbuttons[i].classList.remove('active');
            obj.tags.tabs[i].classList.remove('active');

          });

          this.classList.add('active');
          obj.tags.xsbuttons[index].classList.add('active');
          obj.tags.tabs[index].classList.add('active');

        }, false);

        obj.tags.xsbuttons[index].addEventListener(event, function() {

          obj.each(obj.tags.xsbuttons, function(i) {

            this.classList.remove('active');
            obj.tags.buttons[i].classList.remove('active');
            obj.tags.tabs[i].classList.remove('active');

          });

          this.classList.add('active');
          obj.tags.buttons[index].classList.add('active');
          obj.tags.tabs[index].classList.add('active');

          window.scrollTo(0, window.pageYOffset + this.getBoundingClientRect().top - obj.options.offsetMobile);

        }, false);

        this.addEventListener('click', function(e) {
          e.preventDefault();
        });

      });

      if(!this.triggerActive) {
        this.tags.buttons[0].classList.add('active');
        this.tags.xsbuttons[0].classList.add('active');
        this.tags.tabs[0].classList.add('active');
      }

    },

    each: function(nodes, callback) {

      Array.prototype.forEach.call(nodes, function(node, index) {

        if(callback) {
          callback.call(node, index);
        }

      });

    },

    extendFn: function (destination, source) {

          var property;

      for (property in source) {

        if (source.hasOwnProperty(property)) {
          destination[property] = source[property];
        }
      }

      return destination;
    },

    insert: function (tagname, attrs, txt, element) {

          var tag,
              i;

      tag = document.createElement(tagname);

      for (i in attrs) {
              if (attrs.hasOwnProperty(i)) {
                  tag.setAttribute(i, attrs[i]);
              }
      }

      if(txt) {
        tag.innerHTML = txt;
      }

      if (element) {
        element.parentNode.insertBefore(tag, element);
      }

      return tag;
    }
  }

  window.Tabs = Tabs;

})();