/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
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

app.factory('Hook', function() {
	'use strict';

	return function Hook(context) {
		context.hooks = {};
		const iface = {};
		
		iface.emit = function(identifier, newValue, oldValue) {
			if (Array.isArray(context.hooks[identifier])) {
				context.hooks[identifier].forEach(function(callback) {
					callback(newValue, oldValue);
				});
			}
		};
		
		iface.register = function(identifier, callback) {
			context.hooks[identifier] = context.hooks[identifier] || [];
			context.hooks[identifier].push(callback);
		};

		return iface;
	};
});
