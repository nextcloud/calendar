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
			name: ['NS123', 'n1:element']
		})).toEqual('<n1:element xmlns:n1="NS123"/>');
	});

	it('should return correct xml for one element with attributes', function() {
		expect(XMLUtility.serialize({
			name: ['NS123', 'n1:element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			]
		})).toEqual('<n1:element xmlns:n1="NS123" abc="123" def="456"/>');
	});

	it('should return correct xml for one element with attributes and value', function() {
		expect(XMLUtility.serialize({
			name: ['NS123', 'n1:element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			value: 'test value'
		})).toEqual('<n1:element xmlns:n1="NS123" abc="123" def="456">test value</n1:element>');
	});

	it('should prefer value over children', function() {
		expect(XMLUtility.serialize({
			name: ['NS123', 'n1:element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			value: 'test value',
			children: [{
				name: 'element2'
			}]
		})).toEqual('<n1:element xmlns:n1="NS123" abc="123" def="456">test value</n1:element>');
	});

	it('should return correct xml for one child', function() {
		expect(XMLUtility.serialize({
			name: ['NS123', 'n1:element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			children: [{
				name: ['NS456', 'n2:element2']
			}]
		})).toEqual('<n1:element xmlns:n1="NS123" abc="123" def="456"><n2:element2 xmlns:n2="NS456"/></n1:element>');
	});

	it('should return correct xml for multiple children', function() {
		expect(XMLUtility.serialize({
			name: ['NS123', 'ns1:element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			children: [{
				name: ['NS456', 'ns2:element']
			}, {
				name: ['NS123', 'ns1:element2']
			}]
		})).toEqual('<ns1:element xmlns:ns1="NS123" abc="123" def="456"><ns2:element xmlns:ns2="NS456"/><ns1:element2/></ns1:element>');

	});

	it('should return correct xml for deeply nested objects', function() {
		expect(XMLUtility.serialize({
			name: ['NSDAV', 'd:mkcol'],
			children: [{
				name: ['NSDAV', 'd:set'],
				children: [{
					name: ['NSDAV', 'd:prop'],
					children: [{
						name: ['NSDAV', 'd:resourcetype'],
						children: [{
							name: ['NSDAV', 'd:collection'],
							children: [{
								name: ['NSCAL', 'c:calendar']
							}]
						}, {
							name: ['NSDAV', 'd:displayname'],
							value: 'test_displayname'
						}, {
							name: ['NSOC', 'o:calendar-enabled'],
							value: 1
						}, {
							name: ['NSAAPL', 'a:calendar-order'],
							value: 42
						}, {
							name: ['NSAAPL', 'a:calendar-color'],
							value: '#00FF00'
						}, {
							name: ['NSCAL', 'c:supported-calendar-component-set'],
							children: [{
								name: ['NSCAL', 'c:comp'],
								attributes: [
									['name', 'VEVENT']
								]
							},{
								name: ['NSCAL', 'c:comp'],
								attributes: [
									['name', 'VTODO']
								]
							}]
						}]
					}]
				}]
			}]
		})).toEqual('<d:mkcol xmlns:d="NSDAV"><d:set><d:prop><d:resourcetype><d:collection><c:calendar xmlns:c="NSCAL"/></d:collection><d:displayname>test_displayname</d:displayname><o:calendar-enabled xmlns:o="NSOC">1</o:calendar-enabled><a:calendar-order xmlns:a="NSAAPL">42</a:calendar-order><a:calendar-color xmlns:a="NSAAPL">#00FF00</a:calendar-color><c:supported-calendar-component-set xmlns:c="NSCAL"><c:comp name="VEVENT"/><c:comp name="VTODO"/></c:supported-calendar-component-set></d:resourcetype></d:prop></d:set></d:mkcol>');
	});

	it('should return an empty object when getRootSkeleton is called with no parameters', function() {
		expect(XMLUtility.getRootSkeleton()).toEqual([{}, null]);
	});

	it('should return the root sceleton correctly for one element', function() {
		const expected = {
			name: ['NSDAV', 'd:mkcol'],
			children: []
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'd:mkcol']);
		expect(result).toEqual([expected, expected.children]);
		expect(result[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for two elements', function() {
		const expected = {
			name: ['NSDAV', 'd:mkcol'],
			children: [{
				name: ['NSDAV', 'd:set'],
				children: []
			}]
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'd:mkcol'],
			['NSDAV', 'd:set']);
		expect(result).toEqual([expected, expected.children[0].children]);
		expect(result[0].children[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for three elements', function() {
		const expected = {
			name: ['NSDAV', 'd:mkcol'],
			children: [{
				name: ['NSDAV', 'd:set'],
				children: [{
					name: ['NSDAV', 'd:prop'],
					children: []
				}]
			}]
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'd:mkcol'],
			['NSDAV', 'd:set'], ['NSDAV', 'd:prop']);
		expect(result).toEqual([expected, expected.children[0].children[0].children]);
		expect(result[0].children[0].children[0].children === result[1]).toBe(true);
	});

});
