/**
 * Calendar App
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

app.controller('RecurrenceController', function($scope) {
	'use strict';

	$scope.rruleNotSupported = false;

	$scope.repeat_options_simple = [
		{val: 'NONE', displayname: t('calendar', 'None')},
		{val: 'DAILY', displayname: t('calendar', 'Every day')},
		{val: 'WEEKLY', displayname: t('calendar', 'Every week')},
		{val: 'MONTHLY', displayname: t('calendar', 'Every month')},
		{val: 'YEARLY', displayname: t('calendar', 'Every year')}//,
		//{val: 'CUSTOM', displayname: t('calendar', 'Custom')}
	];

	$scope.selected_repeat_end = 'NEVER';
	$scope.repeat_end = [
		{val: 'NEVER', displayname: t('calendar', 'never')},
		{val: 'COUNT', displayname: t('calendar', 'after')}//,
		//{val: 'UNTIL', displayname: t('calendar', 'on date')}
	];

	$scope.$parent.registerPreHook(function() {
		if ($scope.properties.rrule.freq !== 'NONE') {
			var unsupportedFREQs = ['SECONDLY', 'MINUTELY', 'HOURLY'];
			if (unsupportedFREQs.indexOf($scope.properties.rrule.freq) !== -1) {
				$scope.rruleNotSupported = true;
			}

			if (typeof $scope.properties.rrule.parameters !== 'undefined') {
				var partIds = Object.getOwnPropertyNames($scope.properties.rrule.parameters);
				if (partIds.length > 0) {
					$scope.rruleNotSupported = true;
				}
			}

			if ($scope.properties.rrule.count !== null) {
				$scope.selected_repeat_end = 'COUNT';
			} else if ($scope.properties.rrule.until !== null) {
				$scope.rruleNotSupported = true;
				//$scope.selected_repeat_end = 'UNTIL';
			}

			/*if (!moment.isMoment($scope.properties.rrule.until)) {
			 $scope.properties.rrule.until = moment();
			 }*/

			if ($scope.properties.rrule.interval === null) {
				$scope.properties.rrule.interval = 1;
			}
		}
	});

	$scope.$parent.registerPostHook(function() {
		$scope.properties.rrule.dontTouch = $scope.rruleNotSupported;

		if ($scope.selected_repeat_end === 'NEVER') {
			$scope.properties.rrule.count = null;
			$scope.properties.rrule.until = null;
		}
	});

	$scope.resetRRule = function() {
		$scope.selected_repeat_end = 'NEVER';
		$scope.properties.rrule.freq = 'NONE';
		$scope.properties.rrule.count = null;
		//$scope.properties.rrule.until = null;
		$scope.properties.rrule.interval = 1;
		$scope.rruleNotSupported = false;
		$scope.properties.rrule.parameters = {};
	};


});
