(function() {
	window._pa = window._pa || {};

	_pa.head = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];

	_pa.segments = [{"name":"All visitors","id":443085,"regex":".*"}];
	_pa.conversions = [];
	_pa.conversionEvents = [];
	_pa.segmentEvents = [{"name":"postgres","id":443117}];

	_pa.init = function() {
		_pa.fired = {segments: [], conversions: []};
		_pa.url = document.location.href;
		_pa.pixelHost = ("https:" === document.location.protocol ? "https://secure" : "http://ib") + ".adnxs.com/";
	};

	_pa.addFired = function(type, pixel) {
		if (typeof _pa.fired[type] === 'undefined') {
			_pa.fired[type] = [];
		}
		_pa.fired[type].push(pixel);
	};

	_pa.detect = function() {
		for (var i = 0; i < _pa.segments.length; i++) {
			var segment = _pa.segments[i];
			if (_pa.url.match(new RegExp(segment.regex, 'i'))) {
				fireSegment(segment.id, segment.name);
			}
		}
		for (var i = 0; i < _pa.conversions.length; i++) {
			var conversion = _pa.conversions[i];
			if (_pa.url.match(new RegExp(conversion.regex, 'i'))) {
				fireConversion(conversion.id, conversion.name);
			}
		}
	};

	_pa.track = function(eventName, options) {
		var fired = false;
		options = typeof options !== 'undefined' ? options : {};
		for (var i = 0; i < _pa.conversionEvents.length; i++) {
			var conversionEvent = _pa.conversionEvents[i];
			if (conversionEvent.name === eventName) {
				fired = true;
				fireConversion(conversionEvent.id, conversionEvent.name, options.orderId, options.revenue);
			}
		};
		for (var i = 0; i < _pa.segmentEvents.length; i++) {
			var segmentEvent = _pa.segmentEvents[i];
			if (segmentEvent.name === eventName) {
				fired = true;
				fireSegment(segmentEvent.id, segmentEvent.name);
			}
		};
		return fired;
	};

	_pa.fireLoadEvents = function() {
		if (typeof _pa.onLoadEvent !== "undefined") {
			if (typeof _pa.onLoadEvent === "function") {
				_pa.onLoadEvent();
			} else if (typeof _pa.onLoadEvent === "string") {
				var eventNames = _pa.onLoadEvent.split(',');
				for (var i = 0; i < eventNames.length; i++) {
					var eventName = eventNames[i];
					_pa.track(eventName);
				};
			}
		}
	};

	function createImageTag(type, id, src, name) {
		var t = document.createElement('img');
		t.src = src;
		t.width = 1;
		t.height = 1;
		t.border = 0;
		_pa.head.appendChild(t);
		_pa.addFired(type, {id: id, name: name});
	}

	function fireSegment(id, name) {
		var src = _pa.pixelHost + "seg?t=2&add=" + id;
		createImageTag('segments', id, src, name);
	}

	function fireConversion(id, name, orderId, revenue) {
		var src = _pa.pixelHost + "px?t=2&id=" + id;
		orderId = orderId || _pa.orderId;
		revenue = revenue || _pa.revenue;
		if (orderId && orderId !== "") {
			src += "&order_id=" + orderId;
		}
		if (revenue && revenue !== "") {
			src += "&value=" + revenue;
		}
		createImageTag('conversions', id, src, name);
	}

	_pa.init();
	_pa.fireLoadEvents();
	_pa.detect();

	

	function callFromPq(commandArray) {
		var functionName = commandArray.shift();
		return _pa[functionName].apply(_pa, commandArray);
	}

	if (typeof window._pq !== 'undefined') {
		for(var index = 0; index < _pq.length; index++) {
			var commandArray = _pq[index];
			callFromPq(commandArray);
		}
	}

	window._pq = {
		push: function(commandArray) {
			return callFromPq(commandArray);
		}
	};
})();
