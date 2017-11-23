; (function (global) {

	var mobileDetect = /Android|iPhone|iPad|iPod|BlackBerry|WPDesktop|IEMobile|Opera Mini/i.test(navigator.userAgent);

	var createElement = function (cls, parent) {
		var obj = document.createElement('div');
		obj.className = cls;
		if (parent) {
			parent.appendChild(obj);
		}
		return obj;
	}

	function Popup() {

		this.tags = {};
		this.tags.popup = createElement('popup', document.body);
		this.tags.popup__overlay = createElement('popup__overlay', this.tags.popup);
		this.tags.popup__table = createElement('popup__table', this.tags.popup);
		this.tags.popup__cell = createElement('popup__cell', this.tags.popup__table);
		this.tags.popup__block = createElement('popup__block', this.tags.popup__cell);
		this.tags.popup__close = createElement('popup__close', this.tags.popup__block);
		this.tags.popup__change = createElement('popup__change', this.tags.popup__block);

		this.eventsTrigger = mobileDetect ? 'touchend' : 'mouseup';

		this.events();
		this.scrollWidth = this.scrollWidthElement();

		this.defaults = {
			bodyHidden: true,
			addClassNamePopup: '',
			closeOverlay: true,
			closeShow: true,
			background: '',
			closeButtons: '',
			offsetY: 0,
			offsetX: 0,
			coordElement: ''
		};

	}

	Popup.prototype = {

		options: function (opts) {

			this.defaults = this.extend({
				bodyHidden: true,
				addClassNamePopup: '',
				closeOverlay: true,
				closeShow: true,
				background: '',
				closeButtons: '',
				offsetY: 0,
				offsetX: 0,
				coordElement: ''
			}, opts);

			if (this.defaults.background) {
				this.tags.popup.style.background = this.defaults.background;
			}

			return this;

		},

		extend: function (defaults, source) {

			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					defaults[key] = source[key];
				}
			}

			return defaults;
		},

		addCloseButtons: function () {

			var obj = this;
			var buttons = (this.defaults.closeButtons).split(',');

			buttons.forEach(function (item, index) {

				var selectors = document.querySelectorAll(item.replace(/\s+/g, ''));

				Array.prototype.forEach.call(selectors, function (element, i) {

					element.addEventListener(obj.eventsTrigger, function (e) {

						e.stopPropagation();

						obj.close();

						return false;

					}, false);

				});

			});

		},

		coordSet: function () {

			var obj = this;
			var button = document.querySelector(this.defaults.coordElement);

			if (button) {

				this.coords = button.getBoundingClientRect();

				this.tags.popup__block.style.left = (this.defaults.bodyHidden ? 0 : window.pageXOffset) + this.coords.left + this.defaults.offsetX + 'px';
				this.tags.popup__block.style.top = (this.defaults.bodyHidden ? 0 : window.pageYOffset) + this.coords.top + this.defaults.offsetY + 'px';
				this.tags.popup__block.style.position = 'absolute';

			}

			return this;

		},

		coordReset: function () {

			var obj = this;

			this.defaults = {
				bodyHidden: true,
				addClassNamePopup: '',
				closeOverlay: true,
				closeShow: true,
				background: '',
				closeButtons: '',
				offsetY: 0,
				offsetX: 0,
				coordElement: ''
			};

			setTimeout(function () {
				obj.tags.popup.style.background = '';
			}, 500); // указан в файле стилей transition

			this.tags.popup__block.style.left = '';
			this.tags.popup__block.style.top = '';
			this.tags.popup__block.style.position = '';
			return this;
		},

		setBodyStyle: function () {

			var trigger = window.innerHeight < document.body.scrollHeight;

			if(this.defaults.bodyHidden) {

				document.body.classList.add('popup__body_hidden');

				if (trigger) {
					document.body.style.paddingRight = this.scrollWidth + 'px';
				}

			}

			return this;

		},

		clearBodyStyle: function () {

			document.body.classList.remove('popup__body_hidden');
			document.body.style.paddingRight = '';
			return this;

		},

		html: function (response, callback) {

			if (this.defaults.closeShow) {
				this.tags.popup__close.style.display = '';
			}
			else {
				this.tags.popup__close.style.display = 'none';
			}

			this.setBodyStyle();

			if (this.defaults.coordElement) {

				this.coordSet();

			}

			this.tags.popup__change.innerHTML = response;

			if (callback) {
				callback.call(this.tags.popup, this.defaults, this.eventsTrigger);
			}

			if (this.defaults.closeButtons) {
				this.addCloseButtons();
			}

			return this;

		},

		append: function (response, callback) {

			if (this.defaults.closeShow) {
				this.tags.popup__close.style.display = '';
			}
			else {
				this.tags.popup__close.style.display = 'none';
			}

			this.setBodyStyle();

			if (this.defaults.coordElement) {

				this.coordSet();

			}

			this.tags.popup__change.innerHTML += response;

			if (callback) {
				callback.call(this.tags.popup, this.defaults, this.eventsTrigger);
			}

			if (this.defaults.closeButtons) {
				this.addCloseButtons();
			}

			return this;
		},

		clear: function () {

			this.tags.popup__change.innerHTML = '';
			return this;

		},

		show: function (callback) {

			if(this.defaults.addClassNamePopup) {
				this.tags.popup.classList.add(this.defaults.addClassNamePopup);
			}
			this.tags.popup.classList.add('popup_active');

			if (callback) {
				callback.call(this.tags.popup, this.defaults, this.eventsTrigger);
			}

			return this;

		},

		close: function (callback) {

			var obj = this;

			setTimeout(function () {

				obj.tags.popup.classList.remove('popup_active');
				if(obj.defaults.addClassNamePopup) {
					obj.tags.popup.classList.remove(obj.defaults.addClassNamePopup);
				}
				obj.clear();


				obj.coordReset();

				if (callback) {
					callback.call(obj.tags.popup, obj.defaults, obj.eventsTrigger);
				}

				obj.clearBodyStyle();

			}, 50);

			return this;

		},

		events: function () {

			var obj = this;

			this.tags.popup__close.addEventListener(this.eventsTrigger, function (e) {

				e.stopPropagation();
				obj.close();
				return false;

			}, false);

			this.tags.popup__overlay.addEventListener(this.eventsTrigger, function (e) {

				e.stopPropagation();

				if (obj.defaults.closeOverlay) {
					obj.close();
				}

				return false;

			}, false);

			document.addEventListener('keydown', function (e) {

				if (e.which == 27) {
					obj.close();
				}

			}, false);

		},

		scrollWidthElement: function () {

			var div = document.createElement("div");
			div.style.overflowY = "scroll";
			div.style.width = "50px";
			div.style.height = "50px";
			div.style.visibility = "hidden";

			document.body.appendChild(div);
			var scrollWidth = div.offsetWidth - div.clientWidth;
			document.body.removeChild(div);

			return scrollWidth;

		}
	}

	window.Popup = Popup;

})(window);