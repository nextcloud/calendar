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

app.controller('CalController', ['$scope', 'Restangular', 'CalendarModel', 'EventsModel', 'ViewModel', 'TimezoneModel', 'DialogModel',
	function ($scope, Restangular, CalendarModel, EventsModel, ViewModel, TimezoneModel, DialogModel) {

		$scope.eventSources = EventsModel.getAll();
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

		$scope.eventSource = {};
		$scope.calendars = $scope.calendarModel.getAll();

		$scope.defaultView = angular.element('#fullcalendar').attr('data-defaultView');
		var initEventSources = [];
		angular.forEach($scope.calendars, function (value, key) {
			if ($scope.eventSource[value.id] === undefined) {
				$scope.eventSource[value.id] = {
					events: function (start, end, timezone, callback) {
						start = start.format('X');
						end = end.format('X');
						Restangular.one('calendars', value.id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
							callback(EventsModel.addAllDisplayFigures(value.id, value.displayname, value.color, eventsobject, start, end, $scope.timezone));
						}, function (response) {
							OC.Notification.show(t('calendar', response.data.message));
						});
					},
					color: value.color,
					editable: value.cruds.update,
					id: value.id
				};
				if (value.enabled === true && value.components.vevent === true) {
					initEventSources.push($scope.eventSource[value.id]);
					switcher.push(value.id);
				}
			}
		});

		/**
		 * Calendar UI Configuration.
		*/

		$scope.uiConfig = {
			calendar: {
				height: $(window).height() - $('#controls').height() - $('#header').height(),
				editable: true,
				selectable: true,
				selectHelper: true,
				select: $scope.newEvent,
				eventSources: initEventSources,
				timezone: $scope.defaulttimezone,
				defaultView: $scope.defaultView,
				header: {
					left: '',
					center: '',
					right: ''
				},
				firstDay: angular.element('#firstday').attr('data-firstday'),
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
					angular.element("#datecontrol_date").datepicker("setDate", $scope.calendar.fullCalendar('getDate'));
					var newview = view.name;
					if (newview != $scope.defaultView) {
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
					if (newview == 'agendaWeek') {
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
		$scope.$watch('calendarModel.created', function (createdCalendar) {
			if (createdCalendar === null) {
				return;
			}

			var id = createdCalendar.id;
			$scope.eventSource[id] = {
				events: function (start, end, timezone, callback) {
					start = start.format('X');
					end = end.format('X');
					Restangular.one('calendars', id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
						callback(EventsModel.addAllDisplayFigures(id, eventsobject, start, end, $scope.timezone));
					}, function (response) {
						OC.Notification.show(t('calendar', response.data.message));
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
		}, true);

		/**
		 * After a calendar was updated:
		 * - show/hide
		 * - update calendar
		 * - update permissions
		 */
		$scope.$watch('calendarModel.updated', function(updatedCalendar) {
			if (updatedCalendar === null) {
				return;
			}

			var id = updatedCalendar.id;
			var index = switcher.indexOf(id);

			if (updatedCalendar.enabled === true && index == -1) {
				$scope.calendar.fullCalendar('addEventSource',
					$scope.eventSource[id]);
				switcher.push(id);
			}

			if (updatedCalendar.enabled === false && index != -1) {
				$scope.calendar.fullCalendar('removeEventSource',
					$scope.eventSource[id]);
				switcher.splice(index, 1);
			}

			if ($scope.eventSource[id].color != updatedCalendar.color) {
				// Sadly fullcalendar doesn't support changing a calendar's
				// color without removing and then adding it again as an eventSource
				$scope.eventSource[id].color = updatedCalendar.color;
				if (index != -1) {
					//TODO find a solution
				}
			}
			$scope.eventSource[id].editable = updatedCalendar.cruds.update;
		}, true);

		/**
		 * After a calendar was deleted:
		 * - remove event source from fullcalendar
		 * - delete event source object
		 */
		$scope.$watch('calendarModel.deleted', function(deletedObject) {
			if (deletedObject === null) {
				return;
			}

			$scope.calendar.fullCalendar('removeEventSource',
				$scope.eventSource[deletedObject]);

			delete $scope.eventSource[deletedObject];
		}, true);

		/**
		 * Watches events being added on the fullcalendar. 
		*/

		$scope.$watch('calendarModel.activator', function (newobj, oldobj) {
			if (newobj.id !== '') {
				if (newobj.bool === true) {
					$scope.calendar.fullCalendar('addEventSource', $scope.eventSource[newobj.id]);
				} else {
					$scope.calendar.fullCalendar('removeEventSource', $scope.eventSource[newobj.id]);
				}
			}
		}, true);

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
				if (newview.view != 'today') {
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

		/**
		 * Watches click on first day and resets calendar.
		*/

		$scope.$watch('calendarModel.firstday', function (newview, oldview) {
			$scope.firstdayview = function (newview,calendar) {
				calendar.fullCalendar('firstDay', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.firstdayview(newview, $scope.calendar);
			}
		});
	}
]);
