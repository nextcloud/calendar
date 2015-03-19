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
		$scope.attendornot = 'Required';
		$scope.calendarListSelect = CalendarModel.getAll();
		$scope.relative = true;

		$scope.properties = {
			calcolor: '',
			title : '',
			location : '',
			categories : '',
			description : '',
			attendees : [],
			alarms : []
		};

		$scope.$watch('eventsmodel.eventobject', function (newval, oldval) {
			if(Object.getOwnPropertyNames(newval).length !== 0) {
				if (newval.calendar !== '') {
					$scope.properties = {
						calcolor: newval.calendar.calendarcolor,
						title : newval.title,
						location : newval.location,
						categories : newval.categories,
						description : newval.description,
						attendees : [],
						alarms : []
					};
					for (var i=0; i< $scope.calendarListSelect.length; i++) {
						if (newval.calendar.calendardisplayname === $scope.calendarListSelect[i].displayname) {
							$scope.calendardropdown = $scope.calendarListSelect[i];
						}
					}
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

		$scope.changereminder = function (selectedreminder) {
			if (selectedreminder.displayname == 'Custom') {
				$scope.customreminderarea = true;
			}
		};

		$scope.addmorereminders = function () {
			if ($scope.selectedreminder !== '' && $scope.selectedreminder.displayname !== 'Custom') {
				$scope.properties.alarms.push({
					'TRIGGER': {
						value: $scope.selectedreminder,
						props: {}
					},
					'ACTION': {
						value: 'AUDIO',
						props: {}
					}
				});
				$scope.selectedreminder = $scope.reminderSelect[3];
				$scope.customreminderarea = false;
			}
		};

		$scope.changerelativeorabsolute = function (val) {
			if (val == 'relative') {
				$scope.absolutereminderdatetoggle = true;
			} else {
				console.log(val);
				$scope.absolutereminderdatetoggle = false;
			}
		};

		$scope.reminderSelect = [
			{ displayname: t('Calendar', 'At time of event'), email: 'none'},
			{ displayname: t('Calendar', '5 minutes before'), email: 'none'},
			{ displayname: t('Calendar', '10 minutes before'), email: 'none'},
			{ displayname: t('Calendar', '15 minutes before'), email: 'none'},
			{ displayname: t('Calendar', '1 hour before'), email: 'none'},
			{ displayname: t('Calendar', '2 hours before'), email: 'none'},
			{ displayname: t('Calendar', 'Custom'), email: 'none'}
		];



		$scope.remindertypeSelect = [
			{ displayname: t('Calendar', 'Audio'), type: 'audio'},
			{ displayname: t('Calendar', 'E Mail'), type: 'email'},
			{ displayname: t('Calendar', 'Pop up'), type: 'popup'}
		];

		$scope.timeunitreminderSelect = [
			{ displayname: t('Calendar', 'min'), type: 'min'},
			{ displayname: t('Calendar', 'sec'), type: 'sec'},
			{ displayname: t('Calendar', 'week'), type: 'week'}
		];

		$scope.timepositionreminderSelect = [
			{ displayname: t('Calendar', 'Before'), type: 'before'},
			{ displayname: t('Calendar', 'After'), type: 'after'}	
		];

		

		$scope.startendreminderSelect = [
			{ displayname: t('Calendar', 'Start'), type: 'start'},
			{ displayname: t('Calendar', 'End'), type: 'end'}	
		];

		$scope.selectedreminder = $scope.reminderSelect[3];
		$scope.selectedtypereminder = $scope.remindertypeSelect[0];
		$scope.timeunitreminder = $scope.timeunitreminderSelect[0];
		$scope.timepositionreminder = $scope.timepositionreminderSelect[0];
		$scope.startendrelativereminder = $scope.startendreminderSelect[0];
		
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