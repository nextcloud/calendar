/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

describe('EventsEditorDialogService', function () {
	'use strict';

	let EventsEditorDialogService;
	let $uibModal, dismissSpy, renderedPromise, resultPromise, attrSpy, ngElementSpy, addClassSpy, removeClassSpy, widthSpy, constants, settings;
	let $q, $rootScope;

	beforeEach(module('Calendar', function($provide) {
		$uibModal = {};
		$uibModal.open = jasmine.createSpy();

		constants = {};
		settings = {};

		$provide.value('$uibModal', $uibModal);
		$provide.constant('constants', 'constants');
		$provide.constant('settings', 'settings');
	}));

	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}

		dismissSpy = jasmine.createSpy();
		renderedPromise = $q.defer();
		resultPromise = $q.defer();

		$uibModal.open.and.returnValue({
			dismiss: dismissSpy,
			rendered: renderedPromise.promise,
			result: resultPromise.promise
		});

		attrSpy = jasmine.createSpy();
		addClassSpy = jasmine.createSpy();
		removeClassSpy = jasmine.createSpy();
		widthSpy = jasmine.createSpy();
		ngElementSpy = spyOn(angular, 'element').and.returnValue({
			attr: attrSpy,
			addClass: addClassSpy,
			removeClass: removeClassSpy,
			width: widthSpy
		});
	}));

	beforeEach(inject(function (_EventsEditorDialogService_) {
		EventsEditorDialogService = _EventsEditorDialogService_;
	}));

	afterEach(function() {
		ngElementSpy.and.callThrough();
	});

	it ('should open a dialog', () => {
		const scope = {
			"$on": jasmine.createSpy()
		};
		const fcEvent = {
			vevent: {
				calendar: {}
			},
			getSimpleEvent: jasmine.createSpy()
		};
		const positionArray = [];
		const positionCallback = jasmine.createSpy().and.returnValue(positionArray);
		const lockCallback = jasmine.createSpy();
		const unlockCallback = jasmine.createSpy();

		const promise = EventsEditorDialogService.open(scope, fcEvent, positionCallback, lockCallback, unlockCallback);

		let called = false;
		promise.then(() => {
			called = true;
		}).catch(() => {
			fail('was not supposed to fail');
		});

		expect(lockCallback).toHaveBeenCalled();
		expect(fcEvent.getSimpleEvent).toHaveBeenCalled();
		expect($uibModal.open).toHaveBeenCalledWith({
			appendTo: jasmine.any(Object),
			controller: 'EditorController',
			resolve: {
				vevent: jasmine.any(Function),
				simpleEvent: jasmine.any(Function),
				calendar: jasmine.any(Function),
				isNew: jasmine.any(Function),
				emailAddress: jasmine.any(Function),
			},
			scope: scope,
			templateUrl: 'eventssidebareditor.html',
			windowClass: null
		});

		expect(addClassSpy).toHaveBeenCalledWith('with-app-sidebar');
	});

	it ('should submit changes', () => {
		const scope = {
			"$on": jasmine.createSpy().and.returnValue(jasmine.createSpy())
		};
		const fcEvent = {
			vevent: {
				calendar: {}
			},
			getSimpleEvent: jasmine.createSpy()
		};
		const positionArray = [];
		const positionCallback = jasmine.createSpy().and.returnValue(positionArray);
		const lockCallback = jasmine.createSpy();
		const unlockCallback = jasmine.createSpy();

		const promise = EventsEditorDialogService.open(scope, fcEvent, positionCallback, lockCallback, unlockCallback);

		let called = false;
		let result = null;
		promise.then((r) => {
			called = true;
			result = r;
		}).catch(() => {
			fail('was not supposed to fail');
		});

		expect(lockCallback).toHaveBeenCalled();
		expect(fcEvent.getSimpleEvent).toHaveBeenCalled();
		expect($uibModal.open).toHaveBeenCalledWith({
			appendTo: jasmine.any(Object),
			controller: 'EditorController',
			resolve: {
				vevent: jasmine.any(Function),
				simpleEvent: jasmine.any(Function),
				calendar: jasmine.any(Function),
				isNew: jasmine.any(Function),
				emailAddress: jasmine.any(Function),
			},
			scope: scope,
			templateUrl: 'eventssidebareditor.html',
			windowClass: null
		});

		expect(addClassSpy).toHaveBeenCalledWith('with-app-sidebar');

		// submit changes
		const resolvedCalendar = {};
		const revolvedVEvent = {};
		resultPromise.resolve({
			action: 'save',
			calendar: resolvedCalendar,
			vevent: revolvedVEvent,
		});

		$rootScope.$apply();

		expect(removeClassSpy).toHaveBeenCalledWith('with-app-sidebar');
		expect(unlockCallback).toHaveBeenCalled();
		expect(result).toEqual({
			calendar: resolvedCalendar,
			vevent: revolvedVEvent
		});
	});

	// deleting and canceling looks the same for the eventsEditorDialog
	// the reason is neither checked for cancelled nor for deleted
	it ('should cancel a dialog', () => {
		const scope = {
			"$on": jasmine.createSpy().and.returnValue(jasmine.createSpy())
		};
		const fcEvent = {
			vevent: {
				calendar: {}
			},
			getSimpleEvent: jasmine.createSpy()
		};
		const positionArray = [];
		const positionCallback = jasmine.createSpy().and.returnValue(positionArray);
		const lockCallback = jasmine.createSpy();
		const unlockCallback = jasmine.createSpy();

		const promise = EventsEditorDialogService.open(scope, fcEvent, positionCallback, lockCallback, unlockCallback);

		let called = false;
		let result = null;
		promise.then(() => {
			fail('was not supposed to succeed');
		}).catch((r) => {
			called = true;
			result = r;
		});

		expect(lockCallback).toHaveBeenCalled();
		expect(fcEvent.getSimpleEvent).toHaveBeenCalled();
		expect($uibModal.open).toHaveBeenCalledWith({
			appendTo: jasmine.any(Object),
			controller: 'EditorController',
			resolve: {
				vevent: jasmine.any(Function),
				simpleEvent: jasmine.any(Function),
				calendar: jasmine.any(Function),
				isNew: jasmine.any(Function),
				emailAddress: jasmine.any(Function),
			},
			scope: scope,
			templateUrl: 'eventssidebareditor.html',
			windowClass: null
		});

		expect(addClassSpy).toHaveBeenCalledWith('with-app-sidebar');

		// cancel / delete
		resultPromise.reject('cancelled');

		$rootScope.$apply();

		expect(removeClassSpy).toHaveBeenCalledWith('with-app-sidebar');
		expect(unlockCallback).toHaveBeenCalled();
		expect(result).toEqual('cancelled');
	});

	it ('should proceed to the sidebar', () => {
		// TODO
	});

	it ('should supersede existing dialogs', () => {
		// TODO
	});

	it ('should skip the popover when configured', () => {
		// TODO
	});

	it ('should skip the popover when window is too narrow', () => {
		// TODO
	});
});
