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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */

app.constant('fc', {})
	.directive('fc', function(fc, $window) {
	'use strict';

	return {
		restrict: 'A',
		scope: {},
		link: function(scope, elm, attrs) {
			const monthNames = [];
			const monthNamesShort = [];
			for (let i = 0; i < 12; i++) {
				monthNames.push(moment.localeData().months(moment([0, i]), ''));
				monthNamesShort.push(moment.localeData().monthsShort(moment([0, i]), ''));
			}

			const dayNames = [];
			const dayNamesShort = [];
			const momentWeekHelper = moment().startOf('week');
			momentWeekHelper.subtract(momentWeekHelper.format('d'));
			for (let i = 0; i < 7; i++) {
				dayNames.push(moment.localeData().weekdays(momentWeekHelper));
				dayNamesShort.push(moment.localeData().weekdaysShort(momentWeekHelper));
				momentWeekHelper.add(1, 'days');
			}

			const firstDay = +moment().startOf('week').format('d');

			const headerSize = angular.element('#header').height();
			const windowElement = angular.element($window);
			windowElement.bind('resize', function () {
				const newHeight = windowElement.height() - headerSize;
				fc.elm.fullCalendar('option', 'height', newHeight);
			});

			const baseConfig = {
				dayNames: dayNames,
				dayNamesShort: dayNamesShort,
				defaultView: attrs.defaultview,
				editable: true,
				eventLimit: true,
				firstDay: firstDay,
				header: false,
				height: windowElement.height() - headerSize,
				locale: moment.locale(),
				monthNames: monthNames,
				monthNamesShort: monthNamesShort,
				nowIndicator: true,
				selectable: true,
			};
			const controllerConfig = scope.$parent.fcConfig;
			const config = angular.extend({}, baseConfig, controllerConfig);

			fc.elm = $(elm).fullCalendar(config);
		}
	};
});
