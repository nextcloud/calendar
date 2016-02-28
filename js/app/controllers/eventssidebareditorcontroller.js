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

		$scope.previousDtStartDate = null;
		$scope.previousDtStartHour = null;
		$scope.previousDtStartMinute = null;

		$scope.edittimezone = false;
		if (($scope.properties.dtstart.parameters.zone !== 'floating' && $scope.properties.dtstart.parameters.zone !== $scope.defaulttimezone) ||
			($scope.properties.dtend.parameters.zone !== 'floating' && $scope.properties.dtend.parameters.zone !== $scope.defaulttimezone)) {
			$scope.edittimezone = true;
		}

		var localeData = moment.localeData();
		$scope._initializeDateAndTimePicker = function(id) {
			angular.element(id).datepicker({
				dateFormat : localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
				monthNames: moment.months(),
				monthNamesShort: moment.monthsShort(),
				dayNames: moment.weekdays(),
				dayNamesMin: moment.weekdaysMin(),
				dayNamesShort: moment.weekdaysShort(),
				firstDay: localeData.firstDayOfWeek(),
				minDate: null,
				showOtherMonths: true,
				selectOtherMonths: true
			});
			angular.element(id + 'time').timepicker({
				showPeriodLabels: false,
				showLeadingZero: true,
				showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1)
			});
		};

		$scope._fillDateAndTimePicker = function(id, momentObject) {
			if ($scope.properties.dtstart.type === 'date') {
				angular.element(id + 'time').timepicker('setTime', new Date('2000-01-01 00:00'));
			} else {
				angular.element(id + 'time').timepicker('setTime', momentObject.toDate());
			}

			angular.element(id).datepicker('setDate', momentObject.toDate());
		};

		$scope._getMomentFromDateAndTimePicker = function(id) {
			var momentObject = moment(angular.element(id).datepicker('getDate'));

			momentObject.hours(angular.element(id + 'time').timepicker('getHour'));
			momentObject.minutes(angular.element(id + 'time').timepicker('getMinute'));
			momentObject.seconds(0);

			return momentObject;
		};

		$scope.$watch('fromdatemodel', function() {
			if ($scope.previousDtStartDate) {
				var duration = moment.duration(moment(angular.element('#advanced_from').datepicker('getDate')).diff($scope.previousDtStartDate, 'seconds'), 'seconds');
				$scope.previousDtStartDate = moment(angular.element('#advanced_from').datepicker('getDate'));
				$scope.previousDtStartDate.hours(0);
				$scope.previousDtStartDate.minutes(0);
				$scope.previousDtStartDate.seconds(0);

				var dtendMoment = $scope._getMomentFromDateAndTimePicker('#advanced_to');
				dtendMoment.add(duration);

				$scope._fillDateAndTimePicker('#advanced_to', dtendMoment);
			}
		});
		$scope.$watch('fromtimemodel', function() {
			window.setTimeout(function() {
				var duration = moment.duration();
				duration.add(angular.element('#advanced_fromtime').timepicker('getHour') - $scope.previousDtStartHour, 'hours');
				duration.add(angular.element('#advanced_fromtime').timepicker('getMinute') - $scope.previousDtStartMinute, 'minutes');

				$scope.previousDtStartHour = angular.element('#advanced_fromtime').timepicker('getHour');
				$scope.previousDtStartMinute = angular.element('#advanced_fromtime').timepicker('getMinute');

				var dtendMoment = $scope._getMomentFromDateAndTimePicker('#advanced_to');
				dtendMoment.add(duration);

				$scope._fillDateAndTimePicker('#advanced_to', dtendMoment);
				$scope._initializeDateAndTimePicker('#advanced_from');
			}, 100);
		});

		// TODO - when user changes timezone input query timezone from server
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
			$scope.properties.dtstart.value = moment(angular.element('#advanced_from').datepicker('getDate'));
			$scope.properties.dtend.value = moment(angular.element('#advanced_to').datepicker('getDate'));

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';
				$scope.properties.dtend.value.add(1, 'days');
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';

				$scope.properties.dtstart.value.hours(angular.element('#advanced_fromtime').timepicker('getHour'));
				$scope.properties.dtstart.value.minutes(angular.element('#advanced_fromtime').timepicker('getMinute'));
				$scope.properties.dtstart.value.seconds(0);

				$scope.properties.dtend.value.hours(angular.element('#advanced_totime').timepicker('getHour'));
				$scope.properties.dtend.value.minutes(angular.element('#advanced_totime').timepicker('getMinute'));
				$scope.properties.dtend.value.seconds(0);
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

			vevent.calendar = $scope.calendar;
			vevent.patch(recurrenceId, $scope.properties);

			$uibModalInstance.close(vevent);
		};

		$uibModalInstance.rendered.then(function() {
			$scope._initializeDateAndTimePicker('#advanced_from');
			$scope._initializeDateAndTimePicker('#advanced_to');

			if ($scope.properties.dtend.type === 'date') {
				$scope.properties.dtend.value.subtract(1, 'days');
			}
			$scope._fillDateAndTimePicker('#advanced_from', $scope.properties.dtstart.value);
			$scope._fillDateAndTimePicker('#advanced_to', $scope.properties.dtend.value);

			$scope.previousDtStartDate = $scope.properties.dtstart.value.clone();
			$scope.previousDtStartDate.hours(0);
			$scope.previousDtStartDate.minutes(0);
			$scope.previousDtStartDate.seconds(0);

			$scope.previousDtStartHour = angular.element('#advanced_fromtime').timepicker('getHour');
			$scope.previousDtStartMinute = angular.element('#advanced_fromtime').timepicker('getMinute');

			$scope.tabopener(1);
		});

		$scope.tabs = [{
			title: t('Calendar', 'Attendees'), value: 1
		}, {
			title: t('Calendar', 'Reminders'), value: 2
		}];

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

		$scope.repeater = [
			{ val: 'doesnotrepeat' , displayname: t('Calendar', 'Does not repeat')},
			{ val: 'daily' , displayname: t('Calendar', 'Daily')},
			{ val: 'weekly' , displayname: t('Calendar', 'Weekly')},
			{ val: 'weekday' , displayname: t('Calendar', 'Every Weekday')},
			{ val: 'biweekly' , displayname: t('Calendar', 'Bi-weekly')},
			{ val: 'monthly' , displayname: t('Calendar', 'Monthly')},
			{ val: 'yearly' , displayname: t('Calendar', 'Yearly')},
		];
		$scope.repeatmodel = $scope.repeater[0].val;

		$scope.ender = [
			{ val: 'never', displayname: t('Calendar','never')},
			{ val: 'count', displayname: t('Calendar','by occurances')},
			{ val: 'date', displayname: t('Calendar','by date')},
		];

		$scope.monthdays = [
			{ val: 'monthday', displayname: t('Calendar','by monthday')},
			{ val: 'weekday', displayname: t('Calendar','by weekday')}
		];
		$scope.monthdaymodel = $scope.monthdays[0].val;

		$scope.years = [
			{ val: 'bydate', displayname: t('Calendar','by events date')},
			{ val: 'byyearday', displayname: t('Calendar','by yearday(s)')},
			{ val: 'byweekno', displayname: t('Calendar','by week no(s)')},
			{ val: 'bydaymonth', displayname: t('Calendar','by day and month')}
		];

		$scope.weeks = [
			{ val: 'mon', displayname: t('Calendar','Monday')},
			{ val: 'tue', displayname: t('Calendar','Tuesday')},
			{ val: 'wed', displayname: t('Calendar','Wednesday')},
			{ val: 'thu', displayname: t('Calendar','Thursday')},
			{ val: 'fri', displayname: t('Calendar','Friday')},
			{ val: 'sat', displayname: t('Calendar','Saturday')},
			{ val: 'sun', displayname: t('Calendar','Sunday')}
		];

		$scope.changerepeater = function (repeat) {
			if (repeat.val === 'monthly') {
				$scope.monthday = false;
				$scope.yearly = true;
				$scope.weekly = true;
			} else if (repeat.val === 'yearly') {
				$scope.yearly = false;
				$scope.monthday = true;
				$scope.weekly = true;
			} else if (repeat.val === 'weekly') {
				$scope.weekly = false;
				$scope.monthday = true;
				$scope.yearly = true;
			} else {
				$scope.weekly = true;
				$scope.monthday = true;
				$scope.yearly = true;
			}
		};

		// First Day Dropdown
		$scope.recurrenceSelect = [
			{ val: t('calendar', 'Daily'), id: '0' },
			{ val: t('calendar', 'Weekly'), id: '1' },
			{ val: t('calendar', 'Monthly'), id: '2' },
			{ val: t('calendar', 'Yearly'), id: '3' },
			{ val: t('calendar', 'Other'), id: '4' }
		];

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
			{ displayname: t('Calendar', 'Copied for Info'), val : 'NON-PARTICIPANT' }
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
					value: attendee,
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
			if (alarm.editor.absDate.length > 0 && alarm.editor.absTime.length > 0) {
				alarm.trigger.value = moment(alarm.editor.absDate).add(moment.duration(alarm.editor.absTime));
				alarm.trigger.type = 'date-time';
			} //else {
			//show some error message
			//}
		};

		$scope.updateReminderRepeat = function(alarm) {
			alarm.duration.value = parseInt(alarm.editor.repeatNValue) * parseInt(alarm.editor.repeatTimeUnit);
		};
	}
]);