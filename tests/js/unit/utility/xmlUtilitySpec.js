describe('XMLUtility', function () {
	'use strict';

	var XMLUtility;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			XMLUtility = $injector.get('XMLUtility');
		});
	});

	it('should return an empty string when parameter is not an object', function() {
		expect(XMLUtility.serialize()).toEqual('');
		expect(XMLUtility.serialize(null)).toEqual('');
		expect(XMLUtility.serialize(123)).toEqual('');
		expect(XMLUtility.serialize('abc')).toEqual('');
		expect(XMLUtility.serialize([])).toEqual('');
		expect(XMLUtility.serialize({})).toEqual('');
	});

	it('should return correct xml for one element', function() {
		expect(XMLUtility.serialize({
			name: 'element'
		})).toEqual('<element/>');
	});

	it('should return correct xml for one element with attributes', function() {
		expect(XMLUtility.serialize({
			name: 'element',
			attributes: {
				abc: '123',
				def: '456'
			}
		})).toEqual('<element abc="123" def="456"/>');
	});

	it('should return correct xml for one element with attributes and value', function() {
		expect(XMLUtility.serialize({
			name: 'element',
			attributes: {
				abc: '123',
				def: '456'
			},
			value: 'test value'
		})).toEqual('<element abc="123" def="456">test value</element>');
	});

	it('should prefer value over children', function() {
		expect(XMLUtility.serialize({
			name: 'element',
			attributes: {
				abc: '123',
				def: '456'
			},
			value: 'test value',
			children: [{
				name: 'element2'
			}]
		})).toEqual('<element abc="123" def="456">test value</element>');
	});

	it('should return correct xml for one child', function() {
		expect(XMLUtility.serialize({
			name: 'element',
			attributes: {
				abc: '123',
				def: '456'
			},
			children: [{
				name: 'element2'
			}]
		})).toEqual('<element abc="123" def="456"><element2/></element>');
	});

	it('should return correct xml for multiple children', function() {
		expect(XMLUtility.serialize({
			name: 'element',
			attributes: {
				abc: '123',
				def: '456'
			},
			children: [{
				name: 'element2'
			}, {
				name: 'element3'
			}]
		})).toEqual('<element abc="123" def="456"><element2/><element3/></element>');

	});

	it('should return correct xml for deeply nested objects', function() {
		expect(XMLUtility.serialize({
			name: 'd:mkcol',
			attributes: {
				'xmlns:c': 'urn:ietf:params:xml:ns:caldav',
				'xmlns:d': 'DAV:',
				'xmlns:a': 'http://apple.com/ns/ical/',
				'xmlns:o': 'http://owncloud.org/ns'
			},
			children: [{
				name: 'd:set',
				children: [{
					name: 'd:prop',
					children: [{
						name: 'd:resourcetype',
						children: [{
							name: 'd:collection',
							children: [{
								name: 'c:calendar'
							}]
						}, {
							name: 'd:displayname',
							value: 'test_displayname'
						}, {
							name: 'o:calendar-enabled',
							value: 1
						}, {
							name: 'a:calendar-order',
							value: 42
						}, {
							name: 'a:calendar-color',
							value: '#00FF00'
						}, {
							name: 'c:supported-calendar-component-set',
							children: [{
								name: 'c:comp',
								attributes: {
									name: 'VEVENT'
								}
							},{
								name: 'c:comp',
								attributes: {
									name: 'VTODO'
								}
							}]
						}]
					}]
				}]
			}]
		})).toEqual('<d:mkcol xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:d="DAV:" xmlns:a="http://apple.com/ns/ical/" xmlns:o="http://owncloud.org/ns"><d:set><d:prop><d:resourcetype><d:collection><c:calendar/></d:collection><d:displayname>test_displayname</d:displayname><o:calendar-enabled>1</o:calendar-enabled><a:calendar-order>42</a:calendar-order><a:calendar-color>#00FF00</a:calendar-color><c:supported-calendar-component-set><c:comp name="VEVENT"/><c:comp name="VTODO"/></c:supported-calendar-component-set></d:resourcetype></d:prop></d:set></d:mkcol>');
	});

	it('should return an empty object when getRootSceleton is called with no parameters', function() {
		expect(XMLUtility.getRootSceleton()).toEqual([{}, null]);
	});

	it('should return the root sceleton correctly for one element', function() {
		const expected = {
			name: 'd:mkcol',
			attributes: {
				'xmlns:c': 'urn:ietf:params:xml:ns:caldav',
				'xmlns:d': 'DAV:',
				'xmlns:a': 'http://apple.com/ns/ical/',
				'xmlns:o': 'http://owncloud.org/ns'
			},
			children: []
		};
		const result = XMLUtility.getRootSceleton('d:mkcol');
		expect(result).toEqual([expected, expected.children]);
		expect(result[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for two elements', function() {
		const expected = {
			name: 'd:mkcol',
			attributes: {
				'xmlns:c': 'urn:ietf:params:xml:ns:caldav',
				'xmlns:d': 'DAV:',
				'xmlns:a': 'http://apple.com/ns/ical/',
				'xmlns:o': 'http://owncloud.org/ns'
			},
			children: [{
				name: 'd:set',
				children: []
			}]
		};
		const result = XMLUtility.getRootSceleton('d:mkcol', 'd:set');
		expect(result).toEqual([expected, expected.children[0].children]);
		expect(result[0].children[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for three elements', function() {
		const expected = {
			name: 'd:mkcol',
			attributes: {
				'xmlns:c': 'urn:ietf:params:xml:ns:caldav',
				'xmlns:d': 'DAV:',
				'xmlns:a': 'http://apple.com/ns/ical/',
				'xmlns:o': 'http://owncloud.org/ns'
			},
			children: [{
				name: 'd:set',
				children: [{
					name: 'd:prop',
					children: []
				}]
			}]
		};
		const result = XMLUtility.getRootSceleton('d:mkcol', 'd:set', 'd:prop');
		expect(result).toEqual([expected, expected.children[0].children[0].children]);
		expect(result[0].children[0].children[0].children === result[1]).toBe(true);
	});

});
