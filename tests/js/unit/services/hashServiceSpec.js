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

describe('HashService', () => {
	'use strict';

	let HashService, $location;

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue(undefined);

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return false when the hash is undefined or empty', () => {
			const callback1 = jasmine.createSpy();
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect($location.url).toHaveBeenCalled();
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue(null);

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return false when the hash is undefined or empty', () => {
			const callback1 = jasmine.createSpy();
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect($location.url).toHaveBeenCalled();
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return false when the hash is undefined or empty', () => {
			const callback1 = jasmine.createSpy();
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect($location.url).toHaveBeenCalled();
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('fancy_id?param1=value1&param2=value2');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return call registered callbacks', () => {
			let map;
			const callback1 = jasmine.createSpy().and.callFake((p) => map = p);
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect(callback1).toHaveBeenCalledWith(jasmine.any(Map));
			expect(map.size).toEqual(2);
			expect(map.get('param1')).toEqual('value1');
			expect(map.get('param2')).toEqual('value2');
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('#fancy_id?param1=value1&param2=value2');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should handle hashes beginning with #', () => {
			let map;
			const callback1 = jasmine.createSpy().and.callFake((p) => map = p);
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect(callback1).toHaveBeenCalledWith(jasmine.any(Map));
			expect(map.size).toEqual(2);
			expect(map.get('param1')).toEqual('value1');
			expect(map.get('param2')).toEqual('value2');
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('#fancy_id?param1=value1&param2=http%3A%2F%2Fwww.foobar.crazytld%2Fde-sk.ics');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should handle hashes beginning with #', () => {
			let map;
			const callback1 = jasmine.createSpy().and.callFake((p) => map = p);
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect(callback1).toHaveBeenCalledWith(jasmine.any(Map));
			expect(map.size).toEqual(2);
			expect(map.get('param1')).toEqual('value1');
			expect(map.get('param2')).toEqual('http://www.foobar.crazytld/de-sk.ics');
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('#/fancy_id?param1=value1&param2=http%3A%2F%2Fwww.foobar.crazytld%2Fde-sk.ics');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should handle hashes beginning with #/', () => {
			let map;
			const callback1 = jasmine.createSpy().and.callFake((p) => map = p);
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect(callback1).toHaveBeenCalledWith(jasmine.any(Map));
			expect(map.size).toEqual(2);
			expect(map.get('param1')).toEqual('value1');
			expect(map.get('param2')).toEqual('http://www.foobar.crazytld/de-sk.ics');
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('super_fancy_id?param1=value1&param2=value2');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return false when no registered callbacks are available', () => {
			const callback1 = jasmine.createSpy();
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});

	describe('', () => {
		beforeEach(module('Calendar', function ($provide) {
			$location = {};
			$location.url = jasmine.createSpy().and.returnValue('fancy_id');

			$provide.value('$location', $location);
		}));

		beforeEach(inject(function (_HashService_) {
			HashService = _HashService_;
		}));

		it ('should return false when hash contains no ?', () => {
			const callback1 = jasmine.createSpy();
			const callback2 = jasmine.createSpy();

			HashService.runIfApplicable('fancy_id', callback1);
			HashService.runIfApplicable('another_fancy_id', callback2);
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
	});
});
