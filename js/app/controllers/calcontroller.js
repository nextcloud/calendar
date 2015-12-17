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
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$rootScope', 'CalendarService', 'VEventService', 'SettingsService', 'TimezoneService', 'fcHelper', 'objectConverter', 'Restangular', 'is',
	function ($scope, $rootScope, CalendarService, VEventService, SettingsService, TimezoneService, fcHelper, objectConverter, Restangular, is) {
		'use strict';

		$scope.calendars = [];
		$scope.eventSources = [];
		$scope.eventSource = {};
		$scope.defaulttimezone = TimezoneService.current();
		var switcher = [];

		is.loading = true;

		CalendarService.getAll().then(function(calendars) {
			$scope.calendars = calendars;
			is.loading = false;
			// TODO - scope.apply should not be necessary here
			$scope.$apply();
		});

		$rootScope.$on('finishedLoadingCalendars', function() {
			angular.forEach($scope.calendars, function (value) {
				if ($scope.eventSource[value.id] === undefined) {
					$scope.eventSource[value.id] = {
						events: function (start, end, timezone, callback) {
							value.loading = true;
							start = start.format('X');
							end = end.format('X');
							Restangular.one('calendars', value.id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
								callback([]);
								fcHelper.renderJCAL($scope.eventSource[value.id], eventsobject, start, end, $scope.timezone, function(renderedEvent) {
									$scope.calendar.fullCalendar('renderEvent', renderedEvent);
								});
								$rootScope.$broadcast('finishedLoadingEvents', value.id);
							}, function (response) {
								OC.Notification.show(t('calendar', response.data.message));
								$rootScope.$broadcast('finishedLoadingEvents', value.id);
							});
						},
						color: value.color,
						textColor: value.textColor,
						editable: value.cruds.update,
						id: value.id
					};
					if (value.enabled === true && value.components.vevent === true) {
						$scope.calendar.fullCalendar('addEventSource',
							$scope.eventSource[value.id]);
						switcher.push(value.id);
					}
				}
			});
		});

		/**
		 * Creates a New Calendar Events Dialog
		 * - only contains the start date and the end date.
		 */

		$scope.newEvent = function (start, end, jsEvent, view) {
			console.log(start, end, jsEvent, view);
			var initWithData = {
				allDay: !start.hasTime() && !end.hasTime(),
				dtstart: {
					type: start.hasTime() ? 'datetime' : 'date',
					date: start.format('YYYY-MM-DD'),
					time: start.format('HH:mm:ss'),
					zone: $scope.defaulttimezone
				},
				dtend: {
					type: end.hasTime() ? 'datetime' : 'date',
					date: end.format('YYYY-MM-DD'),
					time: end.format('HH:mm:ss'),
					zone: $scope.defaulttimezone
				},
				summary: {
					type: 'text',
					value: t('calendar', 'New event')
				},
				alarm: [],
				attendee: []
			};

			$rootScope.$broadcast('initializeEventEditor', {
				data: initWithData,
				onSuccess: function(newData) {
					var comp = new ICAL.Component(['vcalendar', [], []]);
					//TODO - add a proper prodid with version number
					comp.updatePropertyWithValue('prodid', '-//ownCloud calendar');
					var vevent = new ICAL.Component('vevent');
					comp.addSubcomponent(vevent);

					objectConverter.patch(vevent, {}, newData);

					vevent.updatePropertyWithValue('created', ICAL.Time.now());
					vevent.updatePropertyWithValue('dtstamp', ICAL.Time.now());
					vevent.updatePropertyWithValue('last-modified', ICAL.Time.now());
					//TODO - add UID,
					console.log(comp.toString());
				}
			});
		};

		/**
		 * Calendar UI Configuration.
		*/
		var i;

		var monthNames = [];
		var monthNamesShort = [];
		for (i = 0; i < 12; i++) {
			monthNames.push(moment.localeData().months(moment([0, i]), ''));
			monthNamesShort.push(moment.localeData().monthsShort(moment([0, i]), ''));
		}

		var dayNames = [];
		var dayNamesShort = [];
		var momentWeekHelper = moment().startOf('week');
		momentWeekHelper.subtract(momentWeekHelper.format('d'));
		for (i = 0; i < 7; i++) {
			dayNames.push(moment.localeData().weekdays(momentWeekHelper));
			dayNamesShort.push(moment.localeData().weekdaysShort(momentWeekHelper));
			momentWeekHelper.add(1, 'days');
		}

		$scope.uiConfig = {
			calendar: {
				height: $(window).height() - $('#controls').height() - $('#header').height(),
				editable: true,
				selectable: true,
				selectHelper: true,
				monthNames: monthNames,
				monthNamesShort: monthNamesShort,
				dayNames: dayNames,
				dayNamesShort: dayNamesShort,
				timezone: $scope.defaulttimezone,
				defaultView: angular.element('#fullcalendar').attr('data-defaultView'),
				header: {
					left: '',
					center: '',
					right: ''
				},
				firstDay: moment().startOf('week').format('d'),
				select: $scope.newEvent,
				eventClick: function( event, jsEvent, view ) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (jCalData) {
						var vevent = fcHelper.getCorrectEvent(event, jCalData);
						var simpleData = objectConverter.parse(vevent);

						console.log(simpleData);

						$rootScope.$broadcast('initializeEventEditor', {
							data: simpleData,
							onSuccess: function(newData) {

							}
						});
					});
				},
				eventResize: function (event, delta, revertFunc) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						var data = fcHelper.resizeEvent(event, delta, eventsobject);
						if (data === null) {
							revertFunc();
							return;
						}
						Restangular.one('calendars', event.calendarId).one('events', event.objectUri).customPUT(
							data,
							'',
							{},
							{'Content-Type':'text/calendar'}
						);
					}, function (response) {
						OC.Notification.show(t('calendar', response.data.message));
					});
				},
				eventDrop: function (event, delta, revertFunc) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						var data = fcHelper.dropEvent(event, delta, eventsobject);
						if (data === null) {
							revertFunc();
							return;
						}
						Restangular.one('calendars', event.calendarId).one('events', event.objectUri).customPUT(
							data,
							'',
							{},
							{'Content-Type':'text/calendar'}
						);
					}, function (response) {
						OC.Notification.show(t('calendar', response.data.message));
					});
				},
				viewRender: function (view, element) {
					$scope.calendar = element;
					angular.element('#firstrow').find('.datepicker_current').html(view.title).text();
					angular.element('#datecontrol_date').datepicker('setDate', element.fullCalendar('getDate'));
					var newview = view.name;
					if (newview !== $scope.defaultView) {
						SettingsService.setView(newview);
						$scope.defaultView = newview;
					}
					if (newview === 'agendaDay') {
						angular.element('td.fc-state-highlight').css('background-color', '#ffffff');
					} else {
						angular.element('td.fc-state-highlight').css('background-color', '#ffc');
					}
					if (newview ==='agendaWeek') {
						element.fullCalendar('option', 'aspectRatio', 0.1);
					} else {
						element.fullCalendar('option', 'aspectRatio', 1.35);
					}
				}
			}
		};


		/**
		 * After a calendar was created:
		 * - create a new event source object
		 * - add event source to fullcalendar when enabled is true
		 */
		$rootScope.$on('createdCalendar', function (event, createdCalendar) {
			var id = createdCalendar.id;
			$scope.eventSource[id] = {
				events: function (start, end, timezone, callback) {
					start = start.format('X');
					end = end.format('X');
					Restangular.one('calendars', id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
						callback([]);
						fcHelper.renderJCAL($scope.eventSource[id], eventsobject, start, end, $scope.timezone, function(renderedEvent) {
							$scope.calendar.fullCalendar('renderEvent', renderedEvent);
						});
						$rootScope.$broadcast('finishedLoadingEvents', id);
					}, function (response) {
						OC.Notification.show(t('calendar', response.data.message));
						$rootScope.$broadcast('finishedLoadingEvents', id);
					});
				},
				color: createdCalendar.color,
				editable: createdCalendar.cruds.update,
				id: id
			};

			if (createdCalendar.enabled === true &&
				createdCalendar.components.vevent === true) {
				$scope.calendar.fullCalendar('addEventSource',
					$scope.eventSource[id]);
				switcher.push(id);
			}
		});

		/**
		 * After a calendar was updated:
		 * - show/hide
		 * - update calendar
		 * - update permissions
		 */
		$rootScope.$on('updatedCalendar', function (event, updatedCalendar) {
			var id = updatedCalendar.id;
			var index = switcher.indexOf(id);

			if (updatedCalendar.enabled === true && index ===-1) {
				$scope.calendar.fullCalendar('addEventSource',
					$scope.eventSource[id]);
				switcher.push(id);
			}
			//Events are already visible -> loading finished
			if (updatedCalendar.enabled === true && index !== -1) {
				$rootScope.$broadcast('finishedLoadingEvents', updatedCalendar.id);
			}

			if (updatedCalendar.enabled === false && index !== -1) {
				$scope.calendar.fullCalendar('removeEventSource',
					$scope.eventSource[id]);
				switcher.splice(index, 1);
			}

			if ($scope.eventSource[id].color !== updatedCalendar.color) {
				// Sadly fullcalendar doesn't support changing a calendar's
				// color without removing and then adding it again as an eventSource
				$scope.eventSource[id].color = updatedCalendar.color;
				angular.element('.fcCalendar-id-' + id).css('background-color', updatedCalendar.color);
			}
			$scope.eventSource[id].editable = updatedCalendar.cruds.update;
		});

		/**
		 * After a calendar was deleted:
		 * - remove event source from fullcalendar
		 * - delete event source object
		 */
		$rootScope.$on('removedCalendar', function (event, calendar) {
			var deletedObject = calendar.id;
			$scope.calendar.fullCalendar('removeEventSource',
				$scope.eventSource[deletedObject]);

			delete $scope.eventSource[deletedObject];
		});

		$rootScope.$on('updatedCalendarsVisibility', function (event, calendar) {
			if (calendar.enabled) {
				$scope.calendar.fullCalendar('addEventSource', $scope.eventSource[calendar.id]);
			} else {
				$scope.calendar.fullCalendar('removeEventSource', $scope.eventSource[calendar.id]);
			}
		});

	}
]);
