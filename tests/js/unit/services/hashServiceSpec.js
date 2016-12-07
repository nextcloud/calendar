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

	beforeEach(module('Calendar', function ($provide) {
		$location = {};
		$location.hash = jasmine.createSpy();

		$provide.value('$location', $location);
	}));

	beforeEach(inject(function (_HashService_) {
		HashService = _HashService_;
	}));

	it ('should not allow an identifier to be registered twice', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();
		const callback3 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);
		expect(() => HashService.register('fancy_id', callback3)).toThrowError(Error, 'A callback for this id was already registered in the HashService');
	});

	it ('should allow identifiers to be unregistered', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();
		const callback3 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);
		HashService.unregister('fancy_id');
		HashService.register('fancy_id', callback3);
	});

	it ('should return false when the hash is undefined or empty', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);

		$location.hash.and.returnValue(undefined);
		expect(HashService.call()).toEqual(false);
		expect($location.hash).toHaveBeenCalled();

		$location.hash.and.returnValue(null);
		expect(HashService.call()).toEqual(false);
		expect($location.hash).toHaveBeenCalled();

		$location.hash.and.returnValue('');
		expect(HashService.call()).toEqual(false);
		expect($location.hash).toHaveBeenCalled();
	});

	it ('should return call registered callbacks', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);

		$location.hash.and.returnValue('fancy_id?param1=value1&param2=value2');
		expect(HashService.call()).toEqual(true);
		expect(callback1).toHaveBeenCalledWith('param1=value1&param2=value2');
		expect(callback2).not.toHaveBeenCalled();
	});

	it ('should handle hashes beginning with #', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);

		$location.hash.and.returnValue('#fancy_id?param1=value1&param2=value2');
		expect(HashService.call()).toEqual(true);
		expect(callback1).toHaveBeenCalledWith('param1=value1&param2=value2');
		expect(callback2).not.toHaveBeenCalled();
	});

	it ('should return false when no registered callbacks are available', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);

		$location.hash.and.returnValue('super_fancy_id?param1=value1&param2=value2');
		expect(HashService.call()).toEqual(false);
		expect(callback1).not.toHaveBeenCalled();
		expect(callback2).not.toHaveBeenCalled();
	});

	it ('should return false when hash contains no ?', () => {
		const callback1 = jasmine.createSpy();
		const callback2 = jasmine.createSpy();

		HashService.register('fancy_id', callback1);
		HashService.register('another_fancy_id', callback2);

		$location.hash.and.returnValue('fancy_id');
		expect(HashService.call()).toEqual(false);
		expect(callback1).not.toHaveBeenCalled();
		expect(callback2).not.toHaveBeenCalled();
	});
});
