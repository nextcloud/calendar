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

app.service('SplitterService', ['ICalFactory',
	function(ICalFactory) {
		'use strict';

		// provides function to split big ics blobs into an array of little ics blobs
		return {
			split: function(iCalString) {
				var timezones = [];
				var allObjects = {};

				var jcal = ICAL.parse(iCalString);
				var components = new ICAL.Component(jcal);

				var vtimezones = components.getAllSubcomponents('vtimezone');
				angular.forEach(vtimezones, function (vtimezone) {
					timezones.push(vtimezone);
				});

				var componentNames = ['vevent', 'vjournal', 'vtodo'];
				angular.forEach(componentNames, function (componentName) {
					var vobjects = components.getAllSubcomponents(componentName);
					allObjects[componentName] = {};

					angular.forEach(vobjects, function (vobject) {
						var uid = vobject.getFirstPropertyValue('uid');
						allObjects[componentName][uid] = allObjects[componentName][uid] || [];
						allObjects[componentName][uid].push(vobject);
					});
				});

				var split = [];
				angular.forEach(componentNames, function (componentName) {
					split[componentName] = [];
					angular.forEach(allObjects[componentName], function (objects) {
						var component = ICalFactory.new();
						angular.forEach(timezones, function (timezone) {
							component.addSubcomponent(timezone);
						});
						angular.forEach(objects, function (object) {
							component.addSubcomponent(object);
						});
						split[componentName].push(component.toString());
					});
				});

				return {
					name: components.getFirstPropertyValue('x-wr-calname'),
					color: components.getFirstPropertyValue('x-apple-calendar-color'),
					split: split
				};
			}
		};
	}
]);