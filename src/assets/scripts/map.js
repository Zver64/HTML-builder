$(document).ready(function() {

	var myPlacemark;
	var myMap;

	function createMaps(element, coords, center, zoom) {

		if(!element) {
			return false;
		}

		ymaps.ready(function () {

			myPlacemark;
			myMap = new ymaps.Map(element, {
				center: [parseFloat(center[0]), parseFloat(center[1])],
				zoom: zoom
			}, {
				searchControlProvider: 'yandex#search'
			});

			myMap.controls.remove('searchControl');

			for(var i = 0, l = coords.length; i < l; i += 1) {

				myPlacemark = new ymaps.Placemark([parseFloat(coords[i].x), parseFloat(coords[i].y)], {
					iconCaption: element.getAttribute('data-content')
				}, {
					preset: 'islands#blueCircleDotIconWithCaption'
				});

				myMap.geoObjects.add(myPlacemark);

			}
		});

	}	

	// contact map
	(function() {

		var map = document.getElementById('js-contact-map');

		if(!map) {
			return false;
		}

		var tmp = (map.getAttribute('data-coords')).split(',');
		var coords = []
		coords[0] = {
			x: tmp[0],
			y: tmp[1]
		}

		createMaps(map, coords, tmp,  15);

	})();

	(function() {

		var items = document.querySelectorAll('.js-garants-map__field');
		var map = document.querySelector('#js-garants-map__map');

		if(!items.length || !map) {
			return false;
		}

		var center = (map.getAttribute('data-center')).split(',');

		var coords = []

		$(items).each(function(index) {

			var tmp = (this.getAttribute('data-coords')).split(',');
			
			coords[index] = {
				x: tmp[0],
				y: tmp[1]
			}

			$(this).click(function() {

				$(items).removeClass('active');
				$(this).addClass('active');
				myMap.setCenter([parseFloat(tmp[0]), parseFloat(tmp[1])], 15);

			});
		});

		createMaps(map, coords, center, 9);

	})();

});