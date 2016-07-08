app.factory('SplittedICal', function() {
	'use strict';

	function SplittedICal (name, color) {
		const context = {
			name: name,
			color: color,
			vevents: [],
			vjournals: [],
			vtodos: []
		};
		const iface = {
			_isASplittedICalObject: true
		};

		Object.defineProperties(iface, {
			name: {
				get: function() {
					return context.name;
				}
			},
			color: {
				get: function() {
					return context.color;
				}
			},
			vevents: {
				get: function() {
					return context.vevents;
				}
			},
			vjournals: {
				get: function() {
					return context.vjournals;
				}
			},
			vtodos: {
				get: function() {
					return context.vtodos;
				}
			},
			objects: {
				get: function() {
					return []
						.concat(context.vevents)
						.concat(context.vjournals)
						.concat(context.vtodos);
				}
			}
		});

		iface.addObject = function(componentName, object) {
			switch(componentName) {
				case 'vevent':
					context.vevents.push(object);
					break;

				case 'vjournal':
					context.vjournals.push(object);
					break;

				case 'vtodo':
					context.vtodos.push(object);
					break;

				default:
					break;
			}
		};

		return iface;
	}

	SplittedICal.isSplittedICal = function(obj) {
		return obj instanceof SplittedICal || (typeof obj === 'object' && obj !== null && obj._isASplittedICalObject !== null);
	};

	return SplittedICal;
});
