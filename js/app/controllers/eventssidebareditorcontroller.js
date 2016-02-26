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

app.controller('EventsSidebarEditorController', ['$scope', 'TimezoneService', 'AutoCompletionService', 'eventEditorHelper', '$window', '$uibModalInstance', 'vevent', 'recurrenceId', 'isNew', 'properties', 'emailAddress',
	function($scope, TimezoneService, AutoCompletionService, eventEditorHelper, $window, $uibModalInstance, vevent, recurrenceId, isNew, properties, emailAddress) {
		'use strict';

		$scope.properties = properties;
		$scope.is_new = isNew;
		$scope.calendar = isNew ? null : vevent.calendar;
		$scope.oldCalendar = isNew ? null : vevent.calendar;
		$scope.readOnly = isNew ? false : !vevent.calendar.writable;
		$scope.selected = 1;
		$scope.timezones = [];
		$scope.emailAddress = emailAddress;
		$scope.rruleNotSupported = false;

		console.log(properties);

		var startZoneAintFloating = $scope.properties.dtstart.parameters.zone !== 'floating',
			startZoneAintDefaultTz = $scope.properties.dtstart.parameters.zone !== $scope.defaulttimezone,
			endZoneAintFloating = $scope.properties.dtend.parameters.zone !== 'floating',
			endZoneAintDefaultTz = $scope.properties.dtend.parameters.zone !== $scope.defaulttimezone;

		$scope.edittimezone = ((startZoneAintFloating && startZoneAintDefaultTz) || (endZoneAintFloating && endZoneAintDefaultTz));

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

		$scope.$watch('properties.dtstart.value', function(nv, ov) {
			var diff = nv.diff(ov, 'seconds');
			if (diff !== 0) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(diff, 'seconds'));
			}
		});

		$scope.loadTimezone = function(tzId) {
			TimezoneService.get(tzId).then(function(timezone) {
				ICAL.TimezoneService.register(tzId, timezone.jCal);
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

		$scope.save = function() {
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

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';
				$scope.properties.dtend.value.add(1, 'days');
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';
			}

			$scope.properties.attendee = $scope.properties.attendee || [];
			if ($scope.properties.attendee.length > 0 && $scope.properties.organizer === null) {
				$scope.properties.organizer = {
					value: 'MAILTO:' + emailAddress,
					parameters: {
						cn: OC.getCurrentUser().displayName
					}
				};
			}

			$scope.properties.rrule.dontTouch = $scope.rruleNotSupported;

			if ($scope.selected_repeat_end === 'NEVER') {
				$scope.properties.rrule.count = null;
				$scope.properties.rrule.until = null;
			}

			angular.forEach($scope.properties.alarm, function(alarm) {
				if (alarm.editor.triggerType === 'absolute') {
					alarm.trigger.value = alarm.editor.absMoment;
				}
				console.log(alarm);

			});

			vevent.calendar = $scope.calendar;
			vevent.patch(recurrenceId, $scope.properties);

			$uibModalInstance.close(vevent);
		};

		$uibModalInstance.rendered.then(function() {
			eventEditorHelper.prepareProperties($scope.properties);

			if ($scope.properties.dtend.type === 'date') {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.subtract(1, 'days'));
			}

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

			$scope.tabopener(1);
		});

		$scope.tabs = [
			{title: t('calendar', 'Attendees'), value: 1},
			{title: t('calendar', 'Reminders'), value: 2},
			{title: t('calendar', 'Repeating'), value: 3}
		];

		$scope.tabopener = function (val) {
			$scope.selected = val;
			if (val === 1) {
				$scope.eventsattendeeview = true;
				$scope.eventsalarmview = false;
				$scope.eventsrepeatview = false;
			} else if (val === 2) {
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = true;
				$scope.eventsrepeatview = false;
			} else if (val === 3) {
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = false;
				$scope.eventsrepeatview = true;
			}
		};

		$scope.searchLocation = function(value) {
			return AutoCompletionService.searchLocation(value);
		};

		$scope.selectLocationFromTypeahead = function(item) {
			$scope.properties.location.value = item.label;
		};

		$scope.repeat_options_simple = [
			{val: 'NONE', displayname: t('Calendar', 'None')},
			{val: 'DAILY', displayname: t('Calendar', 'Every day')},
			{val: 'WEEKLY', displayname: t('Calendar', 'Every week')},
			{val: 'MONTHLY', displayname: t('Calendar', 'Every month')},
			{val: 'YEARLY', displayname: t('Calendar', 'Every year')}//,
			//{val: 'CUSTOM', displayname: t('calendar', 'Custom')}
		];

		$scope.selected_repeat_end = 'NEVER';
		$scope.repeat_end = [
			{val: 'NEVER', displayname: t('Calendar', 'never')},
			{val: 'COUNT', displayname: t('Calendar', 'after')}//,
			//{val: 'UNTIL', displayname: t('Calendar', 'on date')}
		];

		$scope.resetRRule = function() {
			$scope.selected_repeat_end = 'NEVER';
			$scope.properties.rrule.freq = 'NONE';
			$scope.properties.rrule.count = null;
			//$scope.properties.rrule.until = null;
			$scope.properties.rrule.interval = 1;
			$scope.rruleNotSupported = false;
			$scope.properties.rrule.parameters = {};
		};

		$scope.cutstats = [
			{ displayname: t('Calendar', 'Individual'), val : 'INDIVIDUAL' },
			{ displayname: t('Calendar', 'Group'), val : 'GROUP' },
			{ displayname: t('Calendar', 'Resource'), val : 'RESOURCE' },
			{ displayname: t('Calendar', 'Room'), val : 'ROOM' },
			{ displayname: t('Calendar', 'Unknown'), val : 'UNKNOWN' }
		];

		$scope.partstats = [
			{ displayname: t('Calendar', 'Required'), val : 'REQ-PARTICIPANT' },
			{ displayname: t('Calendar', 'Optional'), val : 'OPT-PARTICIPANT' },
			{ displayname: t('Calendar', 'Does not attend'), val : 'NON-PARTICIPANT' }
		];

		$scope.getLocation = function() {
			/*return Restangular.one('autocompletion').getList('location',
			 { 'location': $scope.properties.location }).then(function(res) {
			 var locations = [];
			 angular.forEach(res, function(item) {
			 locations.push(item.label);
			 });
			 return locations;
			 });*/
		};

		//$scope.changerecurrence = function (id) {
		//	if (id==='4') {
		//		EventsModel.getrecurrencedialog('#repeatdialog');
		//	}
		//};

		$scope.changestat = function (blah,attendeeval) {
			for (var i = 0; i < $scope.properties.attendee.length; i++) {
				if ($scope.properties.attendee[i].value === attendeeval) {
					$scope.properties.attendee[i].parameters.CUTTYPE = blah.val;
				}
			}
		};

		$scope.newAttendeeGroup = -1;
		$scope.addmoreattendees = function (val) {
			var attendee = val;
			if (attendee !== '') {
				$scope.properties.attendee = $scope.properties.attendee || [];
				$scope.properties.attendee.push({
					value: 'MAILTO:' + attendee,
					group: $scope.newAttendeeGroup--,
					parameters: {
						'role': 'REQ-PARTICIPANT',
						'rsvp': true,
						'partstat': 'NEEDS-ACTION',
						'cutype': 'INDIVIDUAL'
					}
				});
			}
			$scope.attendeeoptions = false;
		};

		$scope.deleteAttendee = function (val) {
			for (var key in $scope.properties.attendee) {
				console.warn();
				if ($scope.properties.attendee[key].value === val) {
					$scope.properties.attendee.splice(key, 1);
					break;
				}
			}
		};

		$scope.searchAttendee = function(value) {
			return AutoCompletionService.searchAttendee(value);
		};

		$scope.selectAttendeeFromTypeahead = function(item) {
			$scope.properties.attendee = $scope.properties.attendee || [];
			$scope.properties.attendee.push({
				value: 'MAILTO:' + item.email,
				parameters: {
					cn: item.name,
					role: 'REQ-PARTICIPANT',
					rsvp: true,
					partstat: 'NEEDS-ACTION',
					cutype: 'INDIVIDUAL'
				}
			});
			$scope.nameofattendee = '';
		};

		$scope.classSelect = [
			{displayname: t('calendar', 'When shared show full event'), type: 'PUBLIC'},
			{displayname: t('calendar', 'When shared show only busy'), type: 'CONFIDENTIAL'},
			{displayname: t('calendar', 'When shared hide this event'), type: 'PRIVATE'}
		];

		$scope.setClassToDefault = function() {
			if ($scope.properties.class === null) {
				$scope.properties.class = {
					type: 'string',
					value: 'PUBLIC'
				};
			}
		};

		/**
		 * Everything reminders
		 * - ui related scope variables
		 * - content of select blocks
		 * - related functions
		 */
		$scope.selectedReminderId = null;
		$scope.newReminderId = -1;

		$scope.reminderSelect = [
			{ displayname: t('Calendar', 'At time of event'), trigger: 0},
			{ displayname: t('Calendar', '5 minutes before'), trigger: -1 * 5 * 60},
			{ displayname: t('Calendar', '10 minutes before'), trigger: -1 * 10 * 60},
			{ displayname: t('Calendar', '15 minutes before'), trigger: -1 * 15 * 60},
			{ displayname: t('Calendar', '30 minutes before'), trigger: -1 * 30 * 60},
			{ displayname: t('Calendar', '1 hour before'), trigger: -1 * 60 * 60},
			{ displayname: t('Calendar', '2 hours before'), trigger: -1 * 2 * 60 * 60},
			{ displayname: t('Calendar', 'Custom'), trigger: 'custom'}
		];

		$scope.reminderTypeSelect = [
			{ displayname: t('Calendar', 'Audio'), type: 'AUDIO'},
			{ displayname: t('Calendar', 'E Mail'), type: 'EMAIL'},
			{ displayname: t('Calendar', 'Pop up'), type: 'DISPLAY'}
		];

		$scope.timeUnitReminderSelect = [
			{ displayname: t('Calendar', 'sec'), factor: 1},
			{ displayname: t('Calendar', 'min'), factor: 60},
			{ displayname: t('Calendar', 'hours'), factor: 60 * 60},
			{ displayname: t('Calendar', 'days'), factor: 60 * 60 * 24},
			{ displayname: t('Calendar', 'week'), factor: 60 * 60 * 24 * 7}
		];

		$scope.timepositionreminderSelect = [
			{ displayname: t('Calendar', 'Before'), factor: -1},
			{ displayname: t('Calendar', 'After'), factor: 1}
		];

		$scope.startendreminderSelect = [
			{ displayname: t('Calendar', 'Start'), type: 'start'},
			{ displayname: t('Calendar', 'End'), type: 'end'}
		];

		$scope.addReminder = function() {
			//TODO - if a reminder with 15 mins before already exists, create one with 30 minutes before
			var alarm = {
				id: $scope.newReminderId,
				action: {
					type: 'text',
					value: 'AUDIO'
				},
				trigger: {
					type: 'duration',
					value: -900,
					related: 'start'
				},
				repeat: {},
				duration: {},
				attendees: []
			};

			eventEditorHelper.prepareAlarm(alarm);
			$scope.properties.alarm.push(alarm);
			$scope.newReminderId--;
		};

		$scope.deleteReminder = function (group) {
			for (var key in $scope.properties.alarm) {
				console.warn();
				if ($scope.properties.alarm[key].group === group) {
					$scope.properties.alarm.splice(key, 1);
					break;
				}
			}
			console.log('deleted alarm with groupId:' + group);
		};

		$scope.editReminder = function(id) {
			if ($scope.isEditingReminderSupported(id)) {
				$scope.selectedReminderId = id;
			}
		};

		$scope.isEditingReminderSupported = function(group) {
			for (var key in $scope.properties.alarm) {
				if ($scope.properties.alarm[key].group === group) {
					var action = $scope.properties.alarm[key].action.value;
					//WE DON'T AIM TO SUPPORT PROCEDURE
					return (['AUDIO', 'DISPLAY', 'EMAIL'].indexOf(action) !==-1);
				}
			}
			return false;
		};

		$scope.updateReminderSelectValue = function(alarm) {
			var factor = alarm.editor.reminderSelectValue;
			if (factor !== 'custom') {
				alarm.duration = {};
				alarm.repeat = {};
				alarm.trigger.related = 'start';
				alarm.trigger.type = 'duration';
				alarm.trigger.value = parseInt(factor);

				eventEditorHelper.prepareAlarm(alarm);
			}
		};

		$scope.updateReminderRepeat = function(alarm) {
			alarm.repeat.type = 'string';
			alarm.repeat.value = alarm.editor.repeatNTimes;
			alarm.duration.type = 'duration';
			alarm.duration.value = parseInt(alarm.editor.repeatNValue) * parseInt(alarm.editor.repeatTimeUnit);
		};

		$scope.updateReminderRelative = function(alarm) {
			alarm.trigger.value = parseInt(alarm.editor.triggerBeforeAfter) * parseInt(alarm.editor.triggerTimeUnit) * parseInt(alarm.editor.triggerValue);
			alarm.trigger.type = 'duration';
		};

		$scope.updateReminderAbsolute = function(alarm) {
			if (!moment.isMoment(alarm.trigger.value)) {
				alarm.trigger.value = moment();
			}
			alarm.trigger.type = 'date-time';
		};

		/*
		$scope.updateReminderRepeat = function(alarm) {
			alarm.duration.value = parseInt(alarm.editor.repeatNValue) * parseInt(alarm.editor.repeatTimeUnit);
		};
		*/
	}
]);