(function() {

	var mobileDetect = /Android|iPhone|iPad|iPod|BlackBerry|WPDesktop|IEMobile|Opera Mini/i.test(navigator.userAgent);
	var event = mobileDetect ? 'touchend' : 'mouseup';

	function Ratings(opts) {

		var opts = this.extend({
			element: '',
			countRate: 5,
			clickFn: function() {}
		}, opts);

		this.element = opts.element;

		if(!this.element) {
			return;
		}

		this.init(opts);
		this.events(opts);

	}

	Ratings.prototype = {

		init: function (opts) {

			var obj = this;
			this.tags = {};
			this.tags.default_state = this.element.querySelector('.ratings__disable');
			this.tags.hover = this.element.querySelector('.ratings__hover');
			this.tags.click = this.element.querySelector('.ratings__click');

			this.widthElement = this.element.offsetWidth / opts.countRate;
			this.width_votes = 0;
			this.votes = 0;

		},

		events: function(opts) {

			var obj = this;

			this.element.addEventListener('mouseover', function () {

				obj.tags.default_state.style.display = "block";
				obj.tags.hover.style.display = "block";

			}, false);

			this.element.addEventListener('mouseout', function () {

				obj.tags.default_state.style.display = "none";
				obj.tags.hover.style.display = "none";

			}, false);

			this.element.addEventListener('mousemove', function (e) {

				obj.width_votes = e.clientX - obj.element.getBoundingClientRect().left;
				obj.votes = Math.ceil(obj.width_votes / obj.widthElement);
				obj.tags.hover.style.width = obj.votes * obj.widthElement + "px";

			}, false);

			this.element.addEventListener(event, function() {

				obj.tags.click.style.width = obj.votes * obj.widthElement + "px";

				opts.clickFn.call(this, obj.votes);

			}, false);

		},

		extend: function (defaults, source) {

			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					defaults[key] = source[key];
				}
			}

			return defaults;
		}

	};

	window.Ratings = Ratings;

})();