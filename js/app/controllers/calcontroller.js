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

app.controller('CalController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel', 'EventsModel', 'ViewModel', 'TimezoneModel', 'DialogModel',
	function ($scope, $rootScope, Restangular, CalendarModel, EventsModel, ViewModel, TimezoneModel, DialogModel) {
		'use strict';
		$scope.eventSources = [];
		$scope.eventSource = {};
		$scope.calendarModel = CalendarModel;
		$scope.defaulttimezone = TimezoneModel.currenttimezone();
		$scope.eventsmodel = EventsModel;
		$scope.i = 0;
		var switcher = [];
		var viewResource = Restangular.one('view');

		if ($scope.defaulttimezone.length > 0) {
			$scope.requestedtimezone = $scope.defaulttimezone.replace('/', '-');
			Restangular.one('timezones', $scope.requestedtimezone).get().then(function (timezonedata) {
				$scope.timezone = TimezoneModel.addtimezone(timezonedata);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		}

		$rootScope.$on('finishedLoadingCalendars', function() {
			$scope.calendars = $scope.calendarModel.getAll();

			angular.forEach($scope.calendars, function (value) {
				if ($scope.eventSource[value.id] === undefined) {
					$scope.eventSource[value.id] = {
						events: function (start, end, timezone, callback) {
							value.loading = true;
							start = start.format('X');
							end = end.format('X');
							Restangular.one('calendars', value.id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
								//TODO - STRONGLY CONSIDER USING renderEvent and storing events locally in browser, it would speed up rendering a lot
								callback(EventsModel.addAllDisplayFigures(value.id, value.displayname, value.color, eventsobject, start, end, $scope.timezone));
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
			var init = {
				dtstart: {
					type: start.hasTime() ? 'datetime' : 'date',
					date: start.toISOString(),
					timezone: $scope.defaulttimezone
				},
				dtend: {
					type: end.hasTime() ? 'datetime' : 'date',
					date: end.toISOString(),
					timezone: $scope.defaulttimezone
				}
			};

			DialogModel.initbig('#events');
			DialogModel.open('#events');
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
				eventSources: [],
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
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						DialogModel.initbig('#events');
						DialogModel.open('#events');
						EventsModel.modalpropertyholder(event, jsEvent, view, eventsobject);
					});
					//EventsModel.putmodalproperties(event,jsEvent,view);
				},
				eventResize: function (event, delta, revertFunc) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						var data = EventsModel.eventResizer(event, delta, eventsobject);
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
						var data = EventsModel.eventDropper(event, delta, eventsobject);
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
				viewRender: function (view) {
					angular.element('#firstrow').find('.datepicker_current').html(view.title).text();
					angular.element('#datecontrol_date').datepicker('setDate', $scope.calendar.fullCalendar('getDate'));
					var newview = view.name;
					if (newview !== $scope.defaultView) {
						viewResource.get().then(function (newview) {
							ViewModel.add(newview);
						}, function (response) {
							OC.Notification.show(t('calendar', response.data.message));
						});
						$scope.defaultView = newview;
					}
					if (newview === 'agendaDay') {
						angular.element('td.fc-state-highlight').css('background-color', '#ffffff');
					} else {
						angular.element('td.fc-state-highlight').css('background-color', '#ffc');
					}
					if (newview ==='agendaWeek') {
						$scope.calendar.fullCalendar('option', 'aspectRatio', 0.1);
					} else {
						$scope.calendar.fullCalendar('option', 'aspectRatio', 1.35);
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
						callback(EventsModel.addAllDisplayFigures(id, eventsobject, start, end, $scope.timezone));
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
				//if (index !== -1) {
					//TODO find a solution
				//}
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

		/**
		 * Watches the Calendar view.
		*/

		$scope.$watch('calendarModel.modelview', function (newview, oldview) {
			$scope.changeView = function (newview, calendar) {
				calendar.fullCalendar('changeView', newview);
			};
			$scope.today = function (calendar) {
				calendar.fullCalendar('today');
			};
			if (newview.view && $scope.calendar) {
				if (newview.view !== 'today') {
					$scope.changeView(newview.view, $scope.calendar);
				} else {
					$scope.today($scope.calendar);
				}
			}
		}, true);

		/**
		 * Watches the date picker.
		*/

		$scope.$watch('calendarModel.datepickerview', function (newview, oldview) {
			$scope.changeview = function (newview, calendar) {
				calendar.fullCalendar(newview.view);
			};
			if (newview.view !== '' && $scope.calendar !== undefined) {
				$scope.changeview(newview, $scope.calendar);
			}
		}, true);

		/**
		 * Watches the date change and its effect on fullcalendar.
		*/

		$scope.$watch('calendarModel.date', function (newview, oldview) {
			$scope.gotodate = function (newview, calendar) {
				calendar.fullCalendar('gotoDate', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.gotodate(newview, $scope.calendar);
			}
		});
	}
]);
