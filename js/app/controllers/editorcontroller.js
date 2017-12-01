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

/**
 * Controller: Events Dialog Controller
 * Description: Takes care of anything inside the Events Modal.
 */

app.controller('EditorController', ['$scope', 'TimezoneService', 'AutoCompletionService', '$timeout', '$window', '$uibModalInstance', 'vevent', 'simpleEvent', 'calendar', 'isNew', 'emailAddress',
	function($scope, TimezoneService, AutoCompletionService, $timeout, $window, $uibModalInstance, vevent, simpleEvent, calendar, isNew, emailAddress) {
		'use strict';

		$scope.properties = simpleEvent;
		$scope.is_new = isNew;
		$scope.calendar = calendar;
		$scope.oldCalendar = isNew ? calendar : vevent.calendar;
		$scope.readOnly = !vevent.calendar.isWritable();
		$scope.accessibleViaCalDAV = vevent.calendar.eventsAccessibleViaCalDAV();
		$scope.selected = 0;
		$scope.timezones = [];
		$scope.emailAddress = emailAddress;
		$scope.edittimezone = ((
			$scope.properties.dtstart.parameters.zone !== 'floating' &&
			$scope.properties.dtstart.parameters.zone !== $scope.defaulttimezone) || (
			$scope.properties.dtend.parameters.zone !== 'floating' &&
			$scope.properties.dtend.parameters.zone !== $scope.defaulttimezone
		));

		$scope.preEditingHooks = [];
		$scope.postEditingHooks = [];

		$scope.tabs = [
			{title: t('calendar', 'Details'), value: 0},
			{title: t('calendar', 'Attendees'), value: 1},
			{title: t('calendar', 'Reminders'), value: 2},
			{title: t('calendar', 'Repeating'), value: 3}
		];

		$scope.classSelect = [
			{displayname: t('calendar', 'When shared show full event'), type: 'PUBLIC'},
			{displayname: t('calendar', 'When shared show only busy'), type: 'CONFIDENTIAL'},
			{displayname: t('calendar', 'When shared hide this event'), type: 'PRIVATE'}
		];
		
		$scope.statusSelect = [
			{displayname: t('calendar', 'Confirmed'), type: 'CONFIRMED'},
			{displayname: t('calendar', 'Tentative'), type: 'TENTATIVE'},
			{displayname: t('calendar', 'Cancelled'), type: 'CANCELLED'}
		];

		$scope.registerPreHook = function(callback) {
			$scope.preEditingHooks.push(callback);
		};

		$uibModalInstance.rendered.then(function() {
			if ($scope.properties.allDay) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.subtract(1, 'days'));
			}

			autosize($('.advanced--textarea'));
			autosize($('.events--textarea'));

			$timeout(() => {
				autosize.update($('.advanced--textarea'));
				autosize.update($('.events--textarea'));
			}, 50);

			angular.forEach($scope.preEditingHooks, function(callback) {
				callback();
			});

			$scope.tabopener(0);
		});

		$scope.registerPostHook = function(callback) {
			$scope.postEditingHooks.push(callback);
		};

		$scope.proceed = function() {
			$scope.prepareClose();
			$uibModalInstance.close({
				action: 'proceed',
				calendar: $scope.calendar,
				simple: $scope.properties,
				vevent: vevent
			});
		};

		$scope.save = function() {
			if (!$scope.validate()) {
				return;
			}

			$scope.prepareClose();
			$scope.properties.patch();
			$uibModalInstance.close({
				action: 'save',
				calendar: $scope.calendar,
				simple: $scope.properties,
				vevent: vevent
			});
		};

		$scope.keypress = function(event) {
			var code = event.keyCode || event.which;
			if(event.ctrlKey===true && code === 13) {
				$scope.save();
			}
		};

		$scope.validate = function() {
			var error = false;
			if ($scope.properties.summary === null || $scope.properties.summary.value.trim() === '') {
				OC.Notification.showTemporary(t('calendar', 'Please add a title.'));
				error = true;
			}
			if ($scope.calendar === null || typeof $scope.calendar === 'undefined') {
				OC.Notification.showTemporary(t('calendar', 'Please select a calendar.'));
				error = true;
			}
			if (!$scope.properties.checkDtStartBeforeDtEnd()) {
				OC.Notification.showTemporary(t('calendar', 'The event can not end before it starts.'));
				error = true;
			}

			return !error;
		};

		$scope.prepareClose = function() {
			if ($scope.properties.allDay) {
				$scope.properties.dtend.value.add(1, 'days');
			}

			angular.forEach($scope.postEditingHooks, function(callback) {
				callback();
			});
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.delete = function() {
			$uibModalInstance.dismiss('delete');
		};

		$scope.export = function() {
			$window.open($scope.oldCalendar.url + vevent.uri);
		};

		/**
		 * Everything tabs
		 */
		$scope.tabopener = function (val) {
			$scope.selected = val;
			if (val === 0) {
				$scope.eventsdetailsview = true;
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = false;
				$scope.eventsrepeatview = false;
			} else if (val === 1) {
				$scope.eventsdetailsview = false;
				$scope.eventsattendeeview = true;
				$scope.eventsalarmview = false;
				$scope.eventsrepeatview = false;
			} else if (val === 2) {
				$scope.eventsdetailsview = false;
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = true;
				$scope.eventsrepeatview = false;
			} else if (val === 3) {
				$scope.eventsdetailsview = false;
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = false;
				$scope.eventsrepeatview = true;
			}
		};

		/**
		 * Everything calendar select
		 */
		$scope.selectedCalendarChanged = () => {
			if ($scope.calendar.enabled === false) {
				$scope.calendar.enabled = true;
				$scope.calendar.update();
			}
		};

		$scope.showCalendarSelection = function() {
			const writableCalendars = $scope.calendars.filter(function (c) {
				return c.isWritable();
			});

			return writableCalendars.length > 1;
		};

		/**
		 * Everything date and time
		 */
		$scope.$watch('properties.dtstart.value', function(nv, ov) {
			var diff = nv.diff(ov, 'seconds');
			if (diff !== 0) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(diff, 'seconds'));
			}
		});

		$scope.toggledAllDay = function() {
			if ($scope.properties.allDay) {
				return;
			}

			if ($scope.properties.dtstart.value.isSame($scope.properties.dtend.value)) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(1, 'hours'));
			}

			if ($scope.properties.dtstart.parameters.zone === 'floating' &&
				$scope.properties.dtend.parameters.zone === 'floating') {
				$scope.properties.dtstart.parameters.zone = $scope.defaulttimezone;
				$scope.properties.dtend.parameters.zone = $scope.defaulttimezone;
			}
		};
		$scope.$watch('properties.allDay', $scope.toggledAllDay);

		/**
		 * Everything timezones
		 */
		TimezoneService.listAll().then(function(list) {
			if ($scope.properties.dtstart.parameters.zone !== 'floating' &&
				list.indexOf($scope.properties.dtstart.parameters.zone) === -1) {
				list.push($scope.properties.dtstart.parameters.zone);
			}
			if ($scope.properties.dtend.parameters.zone !== 'floating' &&
				list.indexOf($scope.properties.dtend.parameters.zone) === -1) {
				list.push($scope.properties.dtend.parameters.zone);
			}

			angular.forEach(list, function(timezone) {
				if(timezone === 'GMT' || timezone === 'Z') {
					return;
				}

				if (timezone.split('/').length === 1) {
					$scope.timezones.push({
						displayname: timezone,
						group: t('calendar', 'Global'),
						value: timezone
					});
				} else {
					$scope.timezones.push({
						displayname: timezone.split('/').slice(1).join('/'),
						group: timezone.split('/', 1),
						value: timezone
					});
				}
			});

			$scope.timezones.push({
				displayname: t('calendar', 'None'),
				group: t('calendar', 'Global'),
				value: 'floating'
			});
		});

		$scope.loadTimezone = function(tzId) {
			TimezoneService.get(tzId).then(function(timezone) {
				ICAL.TimezoneService.register(tzId, timezone.jCal);
			});
		};

		/**
		 * Everything location
		 */
		$scope.searchLocation = function(value) {
			return AutoCompletionService.searchLocation(value);
		};

		$scope.selectLocationFromTypeahead = function(item) {
			$scope.properties.location.value = item.label;
		};

		/**
		 * Everything access class
		 */
		$scope.setClassToDefault = function() {
			if ($scope.properties.class === null) {
				$scope.properties.class = {
					type: 'string',
					value: 'PUBLIC'
				};
			}
		};
		
		$scope.setStatusToDefault = function() {
			if ($scope.properties.status === null) {
				$scope.properties.status = {
						type: 'string',
						value: 'CONFIRMED'
				};
			}
		};
	}
]);
