describe('DavClient', function () {
	'use strict';

	var DavClient, $window;

	beforeEach(module('Calendar', function ($provide) {
		$window = {};
		$window.location = {};
		$window.location.origin = 'protocol://someFancyOrigin.tld';

		$provide.value('$window', $window);

		spyOn(OC, 'linkToRemote').and.callFake(function(param) {
			return 'foobase123/' + param;
		});
		spyOn(window, 't').and.callThrough();
	}));

	beforeEach(inject(function (_DavClient_) {
		DavClient = _DavClient_;
	}));

	it('should return a davclient.js object', function() {
		expect(OC.linkToRemote).toHaveBeenCalledWith('dav/calendars');

		expect(DavClient.baseUrl).toEqual('foobase123/dav/calendars');
		expect(DavClient.xmlNamespaces).toEqual({
			'DAV:': 'd',
			'urn:ietf:params:xml:ns:caldav': 'c',
			'http://apple.com/ns/ical/': 'aapl',
			'http://owncloud.org/ns': 'oc',
			'http://nextcloud.com/ns': 'nc',
			'http://calendarserver.org/ns/': 'cs'
		});
		expect(dav.Client.prototype.isPrototypeOf(DavClient)).toEqual(true);
	});

	it('should have certain attributes with namespaces', function() {
		expect(DavClient.NS_DAV).toEqual('DAV:');
		expect(DavClient.NS_IETF).toEqual('urn:ietf:params:xml:ns:caldav');
		expect(DavClient.NS_APPLE).toEqual('http://apple.com/ns/ical/');
		expect(DavClient.NS_OWNCLOUD).toEqual('http://owncloud.org/ns');
		expect(DavClient.NS_NEXTCLOUD).toEqual('http://nextcloud.com/ns');
		expect(DavClient.NS_CALENDARSERVER).toEqual('http://calendarserver.org/ns/');
	});

	it('should build an url', function() {
		expect(DavClient.buildUrl('/foobar')).toEqual('protocol://someFancyOrigin.tld/foobar');
		expect(DavClient.buildUrl('foobar')).toEqual('protocol://someFancyOrigin.tld/foobar');
	});

	it('should get a node\'s full name', function() {
		const node = document.createElementNS('NS:', 'foobar');
		expect(DavClient.getNodesFullName(node)).toEqual('{NS:}foobar');
	});

	it('should get the response code from an http response', function() {
		const response1 = 'HTTP/1.1 204 No Content';
		const response2 = 'HTTP/1.1 201 Created';

		expect(DavClient.getResponseCodeFromHTTPResponse(response1)).toEqual(204);
		expect(DavClient.getResponseCodeFromHTTPResponse(response2)).toEqual(201);
	});

	it('should check if a request was successful', function() {
		expect(DavClient.wasRequestSuccessful(100)).toEqual(false);
		expect(DavClient.wasRequestSuccessful(199)).toEqual(false);
		expect(DavClient.wasRequestSuccessful(200)).toEqual(true);
		expect(DavClient.wasRequestSuccessful(242)).toEqual(true);
		expect(DavClient.wasRequestSuccessful(299)).toEqual(true);
		expect(DavClient.wasRequestSuccessful(303)).toEqual(false);
		expect(DavClient.wasRequestSuccessful(401)).toEqual(false);
		expect(DavClient.wasRequestSuccessful(404)).toEqual(false);
		expect(DavClient.wasRequestSuccessful(500)).toEqual(false);
	});

});