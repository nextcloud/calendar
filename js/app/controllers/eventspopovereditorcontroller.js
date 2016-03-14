/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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

/**
 * Controller: Events Dialog Controller
 * Description: Takes care of anything inside the Events Modal.
 */

app.controller('EventsPopoverEditorController', ['$scope', 'TimezoneService', 'AutoCompletionService', '$uibModalInstance', 'vevent', 'simpleEvent', 'isNew',
	function($scope, TimezoneService, AutoCompletionService, $uibModalInstance, vevent, simpleEvent, isNew) {
		'use strict';

		$scope.properties = simpleEvent;
		$scope.is_new = isNew;
		$scope.calendar = isNew ? null : vevent.calendar;
		$scope.oldCalendar = isNew ? null : vevent.calendar;
		$scope.readOnly = isNew ? false : !vevent.calendar.writable;
		$scope.showTimezone = false;

		var startZoneAintFloating = $scope.properties.dtstart.parameters.zone !== 'floating',
			startZoneAintDefaultTz = $scope.properties.dtstart.parameters.zone !== $scope.defaulttimezone,
			endZoneAintFloating = $scope.properties.dtend.parameters.zone !== 'floating',
			endZoneAintDefaultTz = $scope.properties.dtend.parameters.zone !== $scope.defaulttimezone;

		$scope.showTimezone = ((startZoneAintFloating && startZoneAintDefaultTz) || (endZoneAintFloating && endZoneAintDefaultTz));

		$scope.close = function(action) {
			if (action !== 'proceed') {
				var error = false;
				if ($scope.properties.summary === null || $scope.properties.summary.value.trim() === '') {
					OC.Notification.showTemporary(t('calendar', 'Please add a title!'));
					error = true;
				}
				if ($scope.calendar === null || typeof $scope.calendar === 'undefined') {
					OC.Notification.showTemporary(t('calendar', 'Please select a calendar!'));
					error = true;
				}

				if (error) {
					return;
				}
			}

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';
				$scope.properties.dtend.value.add(1, 'days');
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';
			}

			if (action === 'proceed') {
				$uibModalInstance.close({
					action: 'proceed',
					properties: $scope.properties
				});
			} else {
				vevent.calendar = $scope.calendar;
				$scope.properties.patch();

				$uibModalInstance.close({
					action: action,
					event: vevent
				});
			}
		};

		$scope.delete = function() {
			$uibModalInstance.dismiss('delete');
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.searchLocation = function(value) {
			return AutoCompletionService.searchLocation(value);
		};

		$scope.selectLocationFromTypeahead = function(item) {
			$scope.properties.location.value = item.label;
		};

		$scope.toggledAllDay = function() {
			if ($scope.properties.allDay) {
				return;
			}

			if ($scope.properties.dtstart.parameters.zone === 'floating' &&
				$scope.properties.dtend.parameters.zone === 'floating') {
				$scope.properties.dtstart.parameters.zone = $scope.defaulttimezone;
				$scope.properties.dtend.parameters.zone = $scope.defaulttimezone;
			}
		};

		$uibModalInstance.rendered.then(function() {
			if ($scope.properties.dtend.type === 'date') {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.subtract(1, 'days'));
			}
		});

		$scope.$watch('properties.dtstart.value', function(nv, ov) {
			var diff = nv.diff(ov, 'seconds');
			if (diff !== 0) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(diff, 'seconds'));
			}
		});
	}
]);
