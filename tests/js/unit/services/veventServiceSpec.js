describe('VEventService', function () {
	'use strict';

	var VEventService, DavClient, StringUtility, XMLUtility, VEvent, $q, $rootScope;

	beforeEach(module('Calendar', function ($provide) {
		DavClient = {};
		DavClient.NS_DAV = '*NSDAV*';
		DavClient.NS_IETF = '*NSIETF*';
		DavClient.request = jasmine.createSpy();
		DavClient.wasRequestSuccessful = jasmine.createSpy();

		StringUtility = {};
		StringUtility.uid = jasmine.createSpy();

		XMLUtility = {};
		XMLUtility.getRootSkeleton = jasmine.createSpy();
		XMLUtility.serialize = jasmine.createSpy();

		VEvent = {};
		VEvent.fromRawICS = jasmine.createSpy().and.callFake(function() {
			return {
				uri: arguments[2]
			};
		});


		OC.requestToken = 'requestToken42';

		$provide.value('DavClient', DavClient);
		$provide.value('StringUtility', StringUtility);
		$provide.value('XMLUtility', XMLUtility);
		$provide.value('VEvent', VEvent);
	}));

	beforeEach(inject(function (_VEventService_, _$q_, _$rootScope_) {
		VEventService = _VEventService_;
		$q = _$q_;
		$rootScope = _$rootScope_;

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}
	}));

	it('should fetch all events of a calendar - successful', function() {
		const calendar = {
			url: 'calendar-url-123'
		};
		const start = moment("2016-08-28 00:00:00-07:00");
		const end = moment("2016-10-01 23:59:59-07:00");

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const getAllRequest = VEventService.getAll(calendar, start, end);

		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith('c:calendar-query');
		expect(dPropChildren).toEqual([{
			name: 'd:prop',
			children: [{
				name: 'd:getetag'
			}, {
				name: 'c:calendar-data'
			}]
		}, {
			name: 'c:filter',
			children: [{
				name: 'c:comp-filter',
				attributes: {
					name: 'VCALENDAR'
				},
				children: [{
					name: 'c:comp-filter',
					attributes: {
						name: 'VEVENT'
					},
					children: [{
						name: 'c:time-range',
						attributes: {
							start: '20160828T070000Z',
							end: '20161002T065959Z'
						}
					}]
				}]
			}]
		}]);
		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request).toHaveBeenCalledWith('REPORT', 'calendar-url-123', {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': 'requestToken42'
		}, 'xmlPayload1337');

		deferred.resolve({
			body: [{
				href: '/remote.php/dav/calendars/admin/private/Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics',
				propStat: [{
					status: 'HTTP/1.1 200 OK',
					properties: {
						'{*NSDAV*}getetag': '"223c4ded836176fff47a23b820f63930"',
						'{*NSIETF*}calendar-data': 'fancy-ical-data-1'
					}
				}]
			}, {
				href: '/remote.php/dav/calendars/admin/private/Nextcloud-g123jhg13hgghasdgjhasjdghjgsdjasgd123gjjahsgdash.ics',
				propStat: [{
					status: 'HTTP/1.1 200 OK',
					properties: {
						'{*NSDAV*}getetag': '"8769876sdfbsdf876asdasdas78d6987"',
						'{*NSIETF*}calendar-data': 'fancy-ical-data-2'
					}
				}]
			}],
			status: 207
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(207);

		let called = false;
		getAllRequest.then(function(result) {
			expect(result.length).toEqual(2);
			expect(result[0].uri).toEqual('Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics');
			expect(result[1].uri).toEqual('Nextcloud-g123jhg13hgghasdgjhasjdghjgsdjasgd123gjjahsgdash.ics');
			expect(VEvent.fromRawICS.calls.count()).toEqual(2);
			expect(VEvent.fromRawICS.calls.argsFor(0)).toEqual([{url: 'calendar-url-123'}, 'fancy-ical-data-1', 'Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics', '"223c4ded836176fff47a23b820f63930"']);
			expect(VEvent.fromRawICS.calls.argsFor(1)).toEqual([{url: 'calendar-url-123'}, 'fancy-ical-data-2', 'Nextcloud-g123jhg13hgghasdgjhasjdghjgsdjasgd123gjjahsgdash.ics', '"8769876sdfbsdf876asdasdas78d6987"']);
			called = true;
		});
		getAllRequest.catch(function() {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should fetch all events of a calendar - unsuccessful', function() {
		const calendar = {
			url: 'calendar-url-123'
		};
		const start = moment("2016-08-28 00:00:00-07:00");
		const end = moment("2016-10-01 23:59:59-07:00");

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const getAllRequest = VEventService.getAll(calendar, start, end);

		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith('c:calendar-query');
		expect(dPropChildren).toEqual([{
			name: 'd:prop',
			children: [{
				name: 'd:getetag'
			}, {
				name: 'c:calendar-data'
			}]
		}, {
			name: 'c:filter',
			children: [{
				name: 'c:comp-filter',
				attributes: {
					name: 'VCALENDAR'
				},
				children: [{
					name: 'c:comp-filter',
					attributes: {
						name: 'VEVENT'
					},
					children: [{
						name: 'c:time-range',
						attributes: {
							start: '20160828T070000Z',
							end: '20161002T065959Z'
						}
					}]
				}]
			}]
		}]);
		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request).toHaveBeenCalledWith('REPORT', 'calendar-url-123', {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': 'requestToken42'
		}, 'xmlPayload1337');

		deferred.resolve({
			body: [],
			status: 404
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(404);

		let called = false;
		getAllRequest.then(function(result) {
			fail('Promise was not supposed to succeed');
		});
		getAllRequest.catch(function(reason) {
			expect(reason).toEqual(404);
			called = true;
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should fetch a certain event of a calendar - successful', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const uri = 'Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics';

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const getRequest = VEventService.get(calendar, uri);

		expect(DavClient.request).toHaveBeenCalledWith('GET', 'calendar-url-123/Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics', {
			'requesttoken': 'requestToken42'
		}, '');

		deferred.resolve({
			body: 'fancy-ical-data',
			xhr: {
				getResponseHeader: function(header) {
					return header === 'ETag' ? '"223c4ded836176fff47a23b820f63930"' : null;
				}
			},
			status: 200
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(200);

		let called = false;
		getRequest.then(function(result) {
			expect(result.uri).toEqual('Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics');
			expect(VEvent.fromRawICS.calls.count()).toEqual(1);
			expect(VEvent.fromRawICS.calls.argsFor(0)).toEqual([{url: 'calendar-url-123/'}, 'fancy-ical-data', 'Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics', '"223c4ded836176fff47a23b820f63930"']);

			called = true;
		});
		getRequest.catch(function(reason) {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);

	});

	it('should fetch a certain event of a calendar - unsuccessful', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const uri = 'Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics';

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const getRequest = VEventService.get(calendar, uri);

		expect(DavClient.request).toHaveBeenCalledWith('GET', 'calendar-url-123/Nextcloud-m9qnwt85rkqpi5f4x8j2lnmil5llj7p1fbj3fsrmvtg74x6r.ics', {
			'requesttoken': 'requestToken42'
		}, '');

		deferred.resolve({
			status: 404
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(404);

		let called = false;
		getRequest.then(function(result) {
			fail('Promise was not supposed to succeed');
		});
		getRequest.catch(function(reason) {
			expect(reason).toEqual(404);
			called = true;
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should create a new event - successful', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const data = 'fancy-ical-data';
		const returnEvent = false;

		StringUtility.uid.and.returnValue('awesome-uid');

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const createRequest = VEventService.create(calendar, data, returnEvent);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendar-url-123/awesome-uid', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': 'requestToken42'
		}, 'fancy-ical-data');

		deferred.resolve({
			status: 204
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(204);

		let called = false;
		createRequest.then(function(result) {
			expect(result).toEqual(true);
			called = true;
		});
		createRequest.catch(function(reason) {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should create a new event - successful and return event', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const data = 'fancy-ical-data';
		const returnEvent = true;

		StringUtility.uid.and.returnValue('awesome-uid');

		const deferred1 = $q.defer();
		const deferred2 = $q.defer();
		DavClient.request.and.returnValues(deferred1.promise, deferred2.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const createRequest = VEventService.create(calendar, data, returnEvent);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendar-url-123/awesome-uid', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': 'requestToken42'
		}, 'fancy-ical-data');

		deferred1.resolve({
			status: 204
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(204);

		expect(DavClient.request).toHaveBeenCalledWith('GET', 'calendar-url-123/awesome-uid', {
			'requesttoken': 'requestToken42'
		}, '');

		deferred2.resolve({
			body: 'fancy-ical-data',
			xhr: {
				getResponseHeader: function(header) {
					return header === 'ETag' ? '"223c4ded836176fff47a23b820f63930"' : null;
				}
			},
			status: 200
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(200);

		let called = false;
		createRequest.then(function(result) {
			expect(result.uri).toEqual('awesome-uid');
			expect(VEvent.fromRawICS.calls.count()).toEqual(1);
			expect(VEvent.fromRawICS.calls.argsFor(0)).toEqual([{url: 'calendar-url-123/'}, 'fancy-ical-data', 'awesome-uid', '"223c4ded836176fff47a23b820f63930"']);

			called = true;
		});
		createRequest.catch(function(reason) {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should create a new event - unsuccessful', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const data = 'fancy-ical-data';
		const returnEvent = false;

		StringUtility.uid.and.returnValue('awesome-uid');

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const createRequest = VEventService.create(calendar, data, returnEvent);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendar-url-123/awesome-uid', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': 'requestToken42'
		}, 'fancy-ical-data');

		deferred.resolve({
			status: 403
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(403);

		let called = false;
		createRequest.then(function(result) {
			fail('Promise was not supposed to succeed');
		});
		createRequest.catch(function(reason) {
			expect(reason).toEqual(403);
			called = true;
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should create a new event - unsuccessful and return event', function() {
		const calendar = {
			url: 'calendar-url-123/'
		};
		const data = 'fancy-ical-data';
		const returnEvent = true;

		StringUtility.uid.and.returnValue('awesome-uid');

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const createRequest = VEventService.create(calendar, data, returnEvent);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendar-url-123/awesome-uid', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': 'requestToken42'
		}, 'fancy-ical-data');

		deferred.resolve({
			status: 403
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(403);

		let called = false;
		createRequest.then(function(result) {
			fail('Promise was not supposed to succeed');
		});
		createRequest.catch(function(reason) {
			expect(reason).toEqual(403);
			called = true;
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should update an existing events - successful', function() {
		const event = {
			etag: 'etag2.71828',
			uri: 'eventUri42',
			calendar: {
				url: 'calendarurl1337/'
			},
			data: 'foobar3.14159'
		};

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const updateRequest = VEventService.update(event);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendarurl1337/eventUri42', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': 'etag2.71828',
			'requesttoken': 'requestToken42'
		}, 'foobar3.14159');

		deferred.resolve({
			xhr: {
				getResponseHeader: function(header) {
					return header === 'ETag' ? 'etag1337' : null;
				}
			},
			status: 204
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(204);

		let called = false;
		updateRequest.then(function(result) {
			expect(result).toEqual(true);
			expect(event.etag).toEqual('etag1337');
			called = true;
		});
		updateRequest.catch(function(reason) {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should update an existing events - unsuccessful', function() {
		const event = {
			etag: 'etag2.71828',
			uri: 'eventUri42',
			calendar: {
				url: 'calendarurl1337/'
			},
			data: 'foobar3.14159'
		};

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const updateRequest = VEventService.update(event);

		expect(DavClient.request).toHaveBeenCalledWith('PUT', 'calendarurl1337/eventUri42', {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': 'etag2.71828',
			'requesttoken': 'requestToken42'
		}, 'foobar3.14159');

		deferred.resolve({
			status: 412
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(412);

		let called = false;
		updateRequest.then(function(result) {
			fail('Promise was not supposed to succeed');
		});
		updateRequest.catch(function(reason) {
			expect(reason).toEqual(412);
			expect(event.etag).toEqual('etag2.71828');
			called = true;
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should delete an event - successful', function() {
		const event = {
			etag: 'etag2.71828',
			uri: 'eventUri42',
			calendar: {
				url: 'calendarurl1337/'
			}
		};

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const deleteRequest = VEventService.delete(event);
		expect(DavClient.request).toHaveBeenCalledWith('DELETE', 'calendarurl1337/eventUri42', {
			'If-Match': 'etag2.71828',
			'requesttoken': 'requestToken42'
		}, '');

		deferred.resolve({
			status: 204
		});
		$rootScope.$apply();

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(204);

		let called = false;
		deleteRequest.then(function(result) {
			expect(result).toBe(true);
			called = true;
		});
		deleteRequest.catch(function() {
			fail('Promise was not supposed to fail');
		});
		$rootScope.$apply();
		expect(called).toBe(true);
	});

	it('should delete an event - unsuccessful', function() {
		const event = {
			etag: 'etag2.71828',
			uri: 'eventUri42',
			calendar: {
				url: 'calendarurl1337/'
			}
		};

		const deferred = $q.defer();
		DavClient.request.and.returnValue(deferred.promise);
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const deleteRequest = VEventService.delete(event);
		expect(DavClient.request).toHaveBeenCalledWith('DELETE', 'calendarurl1337/eventUri42', {
			'If-Match': 'etag2.71828',
			'requesttoken': 'requestToken42'
		}, '');

		deferred.resolve({
			status: 403
		});
		$rootScope.$apply();

		let called = false;
		deleteRequest.then(function() {
			fail('Promise was not supposed to succeed');
		});
		deleteRequest.catch(function(reason) {
			expect(reason).toEqual(403);
			called = true;
			return true;
		});

		expect(DavClient.wasRequestSuccessful).toHaveBeenCalledWith(403);
		$rootScope.$apply();

		expect(called).toBe(true);
	});
});
