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

app.service('ICalSplitterUtility', function (ICalFactory, SplittedICal) {
	'use strict';

	const calendarColorIdentifier = 'x-apple-calendar-color';
	const calendarNameIdentifier = 'x-wr-calname';
	const componentNames = ['vevent', 'vjournal', 'vtodo'];

	/**
	 * split ics strings into a SplittedICal object
	 * @param {string} iCalString
	 * @returns {SplittedICal}
	 */
	this.split = function (iCalString) {
		const jcal = ICAL.parse(iCalString);
		const components = new ICAL.Component(jcal);

		const objects = {};
		const timezones = components.getAllSubcomponents('vtimezone');

		componentNames.forEach(function (componentName) {
			const vobjects = components.getAllSubcomponents(componentName);
			objects[componentName] = {};

			vobjects.forEach(function (vobject) {
				const uid = vobject.getFirstPropertyValue('uid');
				objects[componentName][uid] = objects[componentName][uid] || [];
				objects[componentName][uid].push(vobject);
			});
		});

		const name = components.getFirstPropertyValue(calendarNameIdentifier);
		const color = components.getFirstPropertyValue(calendarColorIdentifier);

		const split = SplittedICal(name, color);
		componentNames.forEach(function (componentName) {
			for(let objectKey in objects[componentName]) {
				/* jshint loopfunc:true */
				if (!objects[componentName].hasOwnProperty(objectKey)) {
					continue;
				}

				const component = ICalFactory.new();
				timezones.forEach(function (timezone) {
					component.addSubcomponent(timezone);
				});
				objects[componentName][objectKey].forEach(function (object) {
					component.addSubcomponent(object);
				});
				split.addObject(componentName, component.toString());
			}
		});

		return split;
	};
});
