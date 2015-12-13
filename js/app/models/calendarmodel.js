app.factory('Calendar', ['$filter', function($filter) {
	'use strict';

	return function Calendar(url, props) {
		angular.extend(this, {
			url: url,
			enabled: props['{http://owncloud.org/ns}calendar-enabled'] || true,
			displayname: props['{DAV:}displayname'] || 'Unnamed',
			color: props['{http://apple.com/ns/ical/}calendar-color'] || '#1d2d44',
			order: parseInt(props['{http://apple.com/ns/ical/}calendar-order']) || 0,
			components: {
				vevent: false,
				vjournal: false,
				vtodo: false
			},
			cruds: {
				create: true,
				read: true,
				update: true,
				delete: true,
				share: true
				//TODO - implement me
			},
			list: {
				edit: false,
				locked: false
			}
		});

		var components = props['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'];
		for (var i=0; i < components.length; i++) {
			var name = components[i].attributes.getNamedItem('name').textContent.toLowerCase();
			if (this.components.hasOwnProperty(name)) {
				this.components[name] = true;
			}
		}
	};
}]);