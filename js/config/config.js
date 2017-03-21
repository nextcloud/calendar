/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

app.config(['$provide', '$httpProvider',
	function ($provide, $httpProvider) {
		'use strict';

		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

		ICAL.design.defaultSet.param['x-oc-group-id'] = {
			allowXName: true
		};

		angular.forEach($.fullCalendar.locales, function(obj, locale) {
			$.fullCalendar.locale(locale, {
				timeFormat: obj.mediumTimeFormat
			});

			var propsToCheck = ['extraSmallTimeFormat', 'hourFormat', 'mediumTimeFormat', 'noMeridiemTimeFormat', 'smallTimeFormat'];

			angular.forEach(propsToCheck, function(propToCheck) {
				if (obj[propToCheck]) {
					var overwrite = {};
					overwrite[propToCheck] = obj[propToCheck].replace('HH', 'H');

					$.fullCalendar.locale(locale, overwrite);
				}
			});
		});

		const isFirstRun = (angular.element('#fullcalendar').attr('data-firstRun') === 'yes');
		$provide.constant('isFirstRun', isFirstRun);

		const isPublic = (angular.element('#fullcalendar').attr('data-isPublic') === '1');
		$provide.constant('isPublic', isPublic);

		const isSharingAPI = (typeof OC.Share === 'object');
		$provide.constant('isSharingAPI', isSharingAPI);

		const skipPopover = angular.element('#fullcalendar').attr('data-skipPopover') === 'yes';
		const showWeekNr = angular.element('#fullcalendar').attr('data-weekNumbers') === 'yes';
		$provide.constant('settings', {skipPopover, showWeekNr});

		const initialView = angular.element('#fullcalendar').attr('data-initialView');
		const emailAddress = angular.element('#fullcalendar').attr('data-emailAddress');
		const fallbackColor = angular.element('#fullcalendar').attr('data-defaultColor');
		const needsWebCalWorkaround = angular.element('#fullcalendar').attr('data-webCalWorkaround') === 'yes';
		const version = angular.element('#fullcalendar').attr('data-appVersion');
		const publicSharingToken = angular.element('#fullcalendar').attr('data-publicSharingToken');
		$provide.constant('constants', {
			initialView,
			emailAddress,
			fallbackColor,
			needsWebCalWorkaround,
			version,
			publicSharingToken,
			SHARE_TYPE_USER: 0,
			SHARE_TYPE_GROUP: 1
		});
	}
]);
