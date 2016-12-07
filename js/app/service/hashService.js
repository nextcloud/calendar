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

app.service('HashService', function ($location) {
	'use strict';

	const context = {
		callbacks: {}
	};

	/**
	 * register a handler for a certain hash id
	 * @param {string} id
	 * @param {function} callback
	 */
	this.register = (id, callback) => {
		if (context.callbacks[id]) {
			throw new Error('A callback for this id was already registered in the HashService');
		}

		context.callbacks[id] = callback;
	};

	/**
	 * unregister a handler for a certain hash
	 * @param {string} id
	 */
	this.unregister = (id) => {
		delete context.callbacks[id];
	};

	/**
	 * calls a registered handler if necessary
	 */
	this.call = () => {
		let hash = $location.hash();

		if (!hash || hash === '') {
			// nothing to do
			return false;
		}

		if (hash.startsWith('#')) {
			hash = hash.substr(1);
		}

		// the hashes must comply with the following convention
		// #id?param1=value1&param2=value2& ... &paramN=valueN
		// e.g.:
		// #go_to_date?date=2016-12-31
		// #go_to_event?calendar=work&uri=Nextcloud-23as123asf12.ics
		// #search?term=foobar
		// #subscribe_to_webcal?url=https%3A%2F%2Fwww.foo.bar%2F
		//
		// hashes without a question mark after the id will be ignored

		if (!hash.includes('?')) {
			return false;
		}

		const questionMarkPosition = hash.indexOf('?');
		const identifier = hash.substr(0, questionMarkPosition);
		const parameters = hash.substr(questionMarkPosition + 1);

		if (context.callbacks[identifier]) {
			context.callbacks[identifier](parameters);
			return true;
		} else {
			return false;
		}
	};
});
