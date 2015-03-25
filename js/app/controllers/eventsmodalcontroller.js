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

app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'DialogModel', 'Model',
	function ($scope, $routeParams, Restangular, CalendarModel, TimezoneModel, EventsModel, DialogModel, Model) {
		
		$scope.eventsmodel = EventsModel;
		$scope.calendarListSelect = CalendarModel.getAll();

		$scope.properties = {};

		window.showProps = function() {
			return $scope.properties;
		};

		$scope.$watch('eventsmodel.eventobject', function (simpleData) {
			if(Object.getOwnPropertyNames(simpleData).length !== 0) {
				if (simpleData.calendar !== '') {
					$scope.properties = simpleData;
					//for (var i=0; i< $scope.calendarListSelect.length; i++) {
					//	if (newval.calendar.calendardisplayname === $scope.calendarListSelect[i].displayname) {
					//		$scope.calendardropdown = $scope.calendarListSelect[i];
					//	}
					//}

					//prepare alarms
					angular.forEach($scope.properties.alarms, function(value, key) {
						var alarm = $scope.properties.alarms[key];
						var factors = [60,60,24,7];

						alarm.editor = {};
						alarm.editor.reminderSelectValue = ([0, -1 * 5 * 60, -1 * 10 * 60, -1 * 15 * 60, -1 * 60 * 60, -1 * 2 * 60 * 60].indexOf(alarm.trigger.value) != -1) ? alarm.trigger.value : 'custom';

						alarm.editor.triggerType = (alarm.trigger.type === 'duration') ? 'relative' : 'absolute';
						if (alarm.editor.triggerType == 'relative') {
							var triggerValue = Math.abs(alarm.trigger.value);

							alarm.editor.triggerBeforeAfter = (alarm.trigger.value < 0) ? -1 : 1;
							alarm.editor.triggerTimeUnit = 1;

							for (var i = 0; i < factors.length && triggerValue !== 0; i++) {
								var mod = triggerValue % factors[i];
								if (mod != 0) {
									break;
								}

								alarm.editor.triggerTimeUnit *= factors[i];
								triggerValue /= factors[i];
							}

							alarm.editor.triggerValue = triggerValue;
						} else {
							alarm.editor.triggerValue = 15;
							alarm.editor.triggerBeforeAfter = -1;
							alarm.editor.triggerTimeUnit = 60;
						}

						if (alarm.editor.triggerType == 'absolute') {
							alarm.editor.absDate = alarm.trigger.value.format('L');
							alarm.editor.absTime = alarm.trigger.value.format('LT');
						} else {
							alarm.editor.absDate = null;
							alarm.editor.absTime = null;
						}

						alarm.editor.repeat = !(!alarm.repeat.value || alarm.repeat.value === 0);
						alarm.editor.repeatNTimes = (alarm.editor.repeat) ? alarm.repeat.value : 0;
						alarm.editor.repeatTimeUnit = 1;

						var repeatValue = (alarm.duration && alarm.duration.value) ? alarm.duration.value : 0;

						for (var i = 0; i < factors.length && repeatValue !== 0; i++) {
							var mod = repeatValue % factors[i];
							if (mod != 0) {
								break;
							}

							alarm.editor.repeatTimeUnit *= factors[i];
							repeatValue /= factors[i];
						}

						alarm.editor.repeatNValue = repeatValue;
					});
				}
			}
		});

		$scope.getLocation = function(val) {
			return Restangular.one('autocompletion').getList('location',
					{ 'location': $scope.properties.location }).then(function(res) {
					var locations = [];
					angular.forEach(res, function(item) {
						locations.push(item.label);
					});
				return locations;
			});
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

		$scope.changerecurrence = function (id) {
			if (id==='4') {
				EventsModel.getrecurrencedialog('#repeatdialog');
			}
		};

		$scope.changestat = function (blah,attendeeval) {
			for (var i = 0; i < $scope.properties.attendees.length; i++) {
				if ($scope.properties.attendees[i].value === attendeeval) {
					$scope.properties.attendees[i].props.CUTTYPE = blah.val;
				}
			}
		};

		$scope.addmoreattendees = function () {
			if ($scope.nameofattendee !== '') {
				$scope.properties.attendees.push({
					value: $scope.nameofattendee,
					props: {
						'ROLE': 'REQ-PARTICIPANT',
						'RSVP': true,
						'PARTSTAT': 'NEEDS-ACTION',
						'X-OC-MAILSENT': false,
						'CUTTYPE': 'INDIVIDUAL'
					}
				});
				$scope.nameofattendee = '';
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
			$scope.properties.alarms.push({
					id: $scope.newReminderId,
					action: {
						type: "text",
						value: "AUDIO"
					},
					trigger: {
						type: "duration",
						value: -900,
						related: "start"
					},
					repeat: {},
					duration: {},
					attendees: [],
					editor: {
						reminderSelectValue: -900,
						triggerType: "relative",
						triggerBeforeAfter: -1,
						triggerTimeUnit: 60,
						triggerValue: 15,
						absDate: null,
						absTime: null,
						repeat: false,
						repeatNTimes: 0,
						repeatTimeUnit: 1,
						repeatNValue: 0
					}
			});
			$scope.newReminderId--;
		};

		$scope.deleteReminder = function (id) {
			for (var key in $scope.properties.alarms) {
				console.warn();
				if ($scope.properties.alarms[key].id === id) {
					$scope.properties.alarms.splice(key, 1);
					break;
				}
			}
			console.log('deleted alarm with id:' + id);
		};

		$scope.editReminder = function(id) {
			if ($scope.isEditingReminderSupported(id)) {
				$scope.selectedReminderId = id;
			}
		};

		$scope.isEditingReminderSupported = function(id) {
			for (var key in $scope.properties.alarms) {
				if ($scope.properties.alarms[key].id === id) {
					var action = $scope.properties.alarms[key].action.value;
					//WE DON'T AIM TO SUPPORT PROCEDURE
					return (['AUDIO', 'DISPLAY', 'EMAIL'].indexOf(action) != -1);
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
			}
		};

		$scope.updateReminderRelative = function(alarm) {
			alarm.trigger.value = parseInt(alarm.editor.triggerBeforeAfter) * parseInt(alarm.editor.triggerTimeUnit) * parseInt(alarm.editor.triggerValue);
			alarm.trigger.type = 'duration';
		};

		$scope.updateReminderAbsolute = function(alarm) {
			if (alarm.editor.absDate.length > 0 && alarm.editor.absTime.length > 0) {
				alarm.trigger.value = moment(alarm.editor.absDate).add(moment.duration(alarm.editor.absTime));
				alarm.trigger.type = 'date-time'
			} else {
				//show some error message
			}
		};

		$scope.updateReminderRepeat = function(alarm) {
			alarm.duration.value = parseInt(alarm.editor.repeatNValue) * parseInt(alarm.editor.repeatTimeUnit);
		};


		$scope.update = function () {
			EventsModel.updateevent($scope.properties);
		};

		// TODO: If this can be taken to Model better do that.
		angular.element('#from').datepicker({
			dateFormat : 'dd-mm-yy'
		});

		angular.element('#to').datepicker({
			dateFormat : 'dd-mm-yy'
		});

		angular.element('#absolutreminderdate').datepicker({
			dateFormat : 'dd-mm-yy'
		});
		angular.element('#fromtime').timepicker({
			showPeriodLabels: false
		});
		angular.element('#totime').timepicker({
			showPeriodLabels: false
		});
		angular.element('#absolutremindertime').timepicker({
			showPeriodLabels: false
		});
	}
]);