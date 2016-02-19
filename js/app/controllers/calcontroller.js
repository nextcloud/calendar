/**
 * ownCloud - Calendar App
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

/**
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$rootScope', '$window', 'CalendarService', 'VEventService', 'SettingsService', 'TimezoneService', 'VEvent', 'is', 'uiCalendarConfig', '$uibModal',
	function ($scope, $rootScope, $window, CalendarService, VEventService, SettingsService, TimezoneService, VEvent, is, uiCalendarConfig, $uibModal) {
		'use strict';

		$scope.calendars = [];
		$scope.eventSources = [];
		$scope.eventSource = {};
		$scope.defaulttimezone = TimezoneService.current();
		TimezoneService.getCurrent().then(function(timezone) {
			ICAL.TimezoneService.register($scope.defaulttimezone, timezone.jCal);
		});
		$scope.eventModal = null;
		var switcher = [];

		var w = angular.element($window);
		w.bind('resize', function () {
			uiCalendarConfig.calendars.calendar
				.fullCalendar('option', 'height', w.height() - angular.element('#header').height());
		});

		is.loading = true;

		CalendarService.getAll().then(function(calendars) {
			$scope.calendars = calendars;
			is.loading = false;
			// TODO - scope.apply should not be necessary here
			$scope.$apply();

			angular.forEach($scope.calendars, function (calendar) {
				$scope.eventSource[calendar.url] = calendar.fcEventSource;
				if (calendar.enabled) {
					uiCalendarConfig.calendars.calendar.fullCalendar(
						'addEventSource',
						$scope.eventSource[calendar.url]);
				}
				switcher.push(calendar.url);
			});
		});

		/**
		 * Creates a New Calendar Events Dialog
		 * - only contains the start date and the end date.
		 */

		$scope.newEvent = function (start, end, jsEvent, view) {
			var fcEvent = {
				id: 'new',
				allDay: !start.hasTime() && !end.hasTime(),
				start: start.clone(),
				end: end.clone(),
				title: t('calendar', 'New event'),
				className: 'new-event-dummy'
			};

			start.add(start.toDate().getTimezoneOffset(), 'minutes');
			end.add(end.toDate().getTimezoneOffset(), 'minutes');

			var vevent = VEvent.fromStartEnd(start, end, $scope.defaulttimezone);
			$scope._initializeEventEditor(vevent, null, true, function() {
				uiCalendarConfig.calendars.calendar.fullCalendar('renderEvent', fcEvent);
				uiCalendarConfig.calendars.calendar.fullCalendar('unselect');

				return $scope._calculatePopoverPosition(angular.element('.new-event-dummy')[0], view);
			}, function(vevent) {
				VEventService.create(vevent.calendar, vevent.data).then(function(vevent) {
					var eventsToRender = vevent.getFcEvent(view.intervalStart, view.intervalEnd, $scope.defaulttimezone);
					angular.forEach(eventsToRender, function(event) {
						uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', 'new');
						uiCalendarConfig.calendars.calendar.fullCalendar(
							'renderEvent',
							event
						);
					});
				});
			}, function() {
				//nothing to do
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', 'new');
			}, function() {
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', 'new');
			});
		};

		$scope._calculatePopoverPosition = function(target, view) {
			var clientRect = target.getClientRects()[0],
				headerHeight = angular.element('#header').height(),
				navigationWidth = angular.element('#app-navigation').width(),
				eventX = clientRect.left - navigationWidth,
				eventY = clientRect.top - headerHeight,
				eventWidth = clientRect.right - clientRect.left,
				windowX = $window.innerWidth - navigationWidth,
				windowY = $window.innerHeight - headerHeight,
				popoverHeight = 300,
				popoverWidth = 450,
				position = [];

			if (eventY / windowY < 0.5) {
				if (view.name === 'agendaDay' || view.name === 'agendaWeek') {
					position.push({
						name: 'top',
						value: clientRect.top - headerHeight + 30
					});
				} else {
					position.push({
						name: 'top',
						value: clientRect.bottom - headerHeight + 20
					});
				}
			} else {
				position.push({
					name: 'top',
					value: clientRect.top - headerHeight - popoverHeight - 20
				});
			}

			if (view.name === 'agendaDay') {
				position.push({
					name: 'left',
					value: clientRect.left - (popoverWidth / 2) - 20 + eventWidth / 2
				});
			} else {
				if (eventX / windowX < 0.25) {
					position.push({
						name: 'left',
						value: clientRect.left - 20 + eventWidth / 2
					});
				} else if (eventX / windowX > 0.75) {
					position.push({
						name: 'left',
						value: clientRect.left - popoverWidth - 20 + eventWidth / 2
					});
				} else {
					position.push({
						name: 'left',
						value: clientRect.left - (popoverWidth / 2) - 20 + eventWidth / 2
					});
				}
			}

			return position;
		};

		$scope._initializeEventEditor = function(vevent, recurrenceId, isNew, positionCallback, successCallback, deleteCallBack, cancelCallback) {
			if ($scope.eventModal !== null) {
				$scope.eventModal.dismiss('superseded');
			}

			$scope.eventModal = $uibModal.open({
				templateUrl: 'eventspopovereditor.html',
				controller: 'EventsPopoverEditorController',
				windowClass: 'popover',
				appendTo: angular.element('#popover-container'),
				resolve: {
					vevent: function() {
						return vevent;
					},
					recurrenceId: function() {
						return recurrenceId;
					},
					isNew: function() {
						return isNew;
					}
				},
				scope: $scope
			});

			$scope.eventModal.rendered.then(function() {
				angular.element('#popover-container').css('display', 'none');

				var position = positionCallback();
				angular.forEach(position, function(v) {
					angular.element('.modal').css(v.name, v.value);
				});

				angular.element('#popover-container').css('display', 'block');
			});

			$scope.eventModal.result.then(function(result) {
				if (result.action === 'save') {
					successCallback(result.event);
				} else if (result.action === 'proceed') {
					$scope.eventModal = $uibModal.open({
						templateUrl: 'eventssidebareditor.html',
						controller: 'EventsSidebarEditorController',
						appendTo: angular.element('#app-content'),
						resolve: {
							vevent: function() {
								return vevent;
							},
							recurrenceId: function() {
								return recurrenceId;
							},
							isNew: function() {
								return isNew;
							},
							properties: function() {
								return result.properties;
							}
						},
						scope: $scope
					});
					angular.element('#app-content').addClass('with-app-sidebar');

					$scope.eventModal.result.then(function(event) {
						successCallback(event);
						$scope.eventModal = null;
						angular.element('#app-content').removeClass('with-app-sidebar');
					}, function(reason) {
						if (reason === 'delete') {
							deleteCallBack(vevent);
							$scope.eventModal = null;
						} else {
							cancelCallback();
						}

						angular.element('#app-content').removeClass('with-app-sidebar');
					});
				}
			}, function(reason) {
				if (reason === 'delete') {
					deleteCallBack(vevent);
					$scope.eventModal = null;
				} else {
					cancelCallback();
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
				height: w.height() - angular.element('#header').height(),
				editable: true,
				selectable: true,
				lang: moment.locale(),
				monthNames: monthNames,
				monthNamesShort: monthNamesShort,
				dayNames: dayNames,
				dayNamesShort: dayNamesShort,
				timezone: $scope.defaulttimezone,
				defaultView: angular.element('#fullcalendar').attr('data-defaultView'),
				header: false,
				firstDay: moment().startOf('week').format('d'),
				select: $scope.newEvent,
				eventLimit: true,
				eventClick: function(fcEvent, jsEvent, view) {
					var oldCalendar = fcEvent.event.calendar;

					console.log(jsEvent.currentTarget);

					$scope._initializeEventEditor(fcEvent.event, fcEvent.recurrenceId, false, function() {
						return $scope._calculatePopoverPosition(jsEvent.currentTarget, view);
					}, function(vevent) {
						if (oldCalendar === vevent.calendar) {
							VEventService.update(vevent).then(function() {
								var id = vevent.uri;
								if (fcEvent.recurrenceId) {
									id += fcEvent.recurrenceId;
								}

								uiCalendarConfig.calendars.calendar.fullCalendar(
									'removeEvents',
									id
								);

								var eventsToRender = vevent.getFcEvent(view.intervalStart, view.intervalEnd, $scope.defaulttimezone);
								angular.forEach(eventsToRender, function(event) {
									uiCalendarConfig.calendars.calendar.fullCalendar(
										'renderEvent',
										event
									);
								});
							});
						} else {
							var newCalendar = vevent.calendar;
							vevent.calendar = oldCalendar;
							VEventService.delete(vevent).then(function() {
								var id = vevent.uri;
								if (fcEvent.recurrenceId) {
									id += fcEvent.recurrenceId;
								}

								uiCalendarConfig.calendars.calendar.fullCalendar(
									'removeEvents',
									id
								);

								VEventService.create(newCalendar, vevent.data).then(function(vevent) {
									var eventsToRender = vevent.getFcEvent(view.intervalStart, view.intervalEnd, $scope.defaulttimezone);
									angular.forEach(eventsToRender, function(event) {
										uiCalendarConfig.calendars.calendar.fullCalendar(
											'renderEvent',
											event
										);
									});
								});
							});
						}
					}, function(vevent) {
						VEventService.delete(vevent).then(function() {
							var id = vevent.uri;
							if (fcEvent.recurrenceId) {
								id += fcEvent.recurrenceId;
							}

							uiCalendarConfig.calendars.calendar.fullCalendar(
								'removeEvents',
								id
							);
						});

					}, function() {
						//do nothing to cancel editing
					});
				},
				eventResize: function (fcEvent, delta, revertFunc) {
					if (!fcEvent.event.resize(fcEvent.recurrenceId, delta)) {
						revertFunc();
					}
					VEventService.update(fcEvent.event);
				},
				eventDrop: function (fcEvent, delta, revertFunc) {
					if(!fcEvent.event.drop(fcEvent.recurrenceId, delta)) {
						revertFunc();
					}
					VEventService.update(fcEvent.event);
				},
				viewRender: function (view, element) {
					angular.element('#firstrow').find('.datepicker_current').html(view.title).text();
					angular.element('#datecontrol_date').datepicker('setDate', element.fullCalendar('getDate'));
					var newView = view.name;
					if (newView !== $scope.defaultView) {
						SettingsService.setView(newView);
						$scope.defaultView = newView;
					}
					if (newView === 'agendaDay') {
						angular.element('td.fc-state-highlight').css('background-color', '#ffffff');
					} else {
						angular.element('.fc-bg td.fc-state-highlight').css('background-color', '#ffc');
					}
					if (newView ==='agendaWeek') {
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
			$scope.eventSource[createdCalendar.url] = createdCalendar.fcEventSource;

			if (createdCalendar.enabled) {
				uiCalendarConfig.calendars.calendar.fullCalendar('addEventSource',
					$scope.eventSource[createdCalendar.url]);
				switcher.push(createdCalendar.url);
			}
		});

		/**
		 * After a calendar was updated:
		 * - show/hide
		 * - update calendar
		 * - update permissions
		 */
		$rootScope.$on('updatedCalendar', function (event, updatedCalendar) {
			var url = updatedCalendar.url;
			var index = switcher.indexOf(url);

			if (updatedCalendar.enabled && index === - 1) {
				uiCalendarConfig.calendars.calendar.fullCalendar('addEventSource',
					$scope.eventSource[url]);
				switcher.push(url);
			}
			//Events are already visible -> loading finished
			if (updatedCalendar.enabled && index !== -1) {
				$rootScope.$broadcast('finishedLoadingEvents', url);
			}

			if (!updatedCalendar.enabled && index !== -1) {
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEventSource',
					$scope.eventSource[url]);
				switcher.splice(index, 1);
			}

			if ($scope.eventSource[url].color !== updatedCalendar.color) {
				// Sadly fullcalendar doesn't support changing a calendar's
				// color without removing and then adding it again as an eventSource
				$scope.eventSource[url].color = updatedCalendar.color;
				angular.element('.fcCalendar-id-' + updatedCalendar.tmpId).css('background-color', updatedCalendar.color);
				angular.element('.fcCalendar-id-' + updatedCalendar.tmpId).css('border-color', updatedCalendar.color);
				angular.element('.fcCalendar-id-' + updatedCalendar.tmpId).css('color', updatedCalendar.textColor);
			}
			$scope.eventSource[url].editable = updatedCalendar.writable;
		});

		/**
		 * After a calendar was deleted:
		 * - remove event source from fullcalendar
		 * - delete event source object
		 */
		$rootScope.$on('removedCalendar', function (event, calendar) {
			$scope.calendars = $scope.calendars.filter(function (element) {
				return element.url !== calendar.url;
			});

			var deletedObject = calendar.url;
			uiCalendarConfig.calendars.calendar.fullCalendar('removeEventSource',
				$scope.eventSource[deletedObject]);

			delete $scope.eventSource[deletedObject];
		});

		$rootScope.$on('refetchEvents', function (event, calendar) {
			if (switcher.indexOf(calendar.url) !== -1) {
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEventSource', $scope.eventSource[calendar.url]);
				uiCalendarConfig.calendars.calendar.fullCalendar('addEventSource', $scope.eventSource[calendar.url]);
			}
		});

		/**
		 * After a calendar's visibility was changed:
		 * - add event source to fullcalendar if enabled is true
		 * - remove event source from fullcalendar if enabled is false
		 */
		$rootScope.$on('updatedCalendarsVisibility', function (event, calendar) {
			if (calendar.enabled) {
				uiCalendarConfig.calendars.calendar.fullCalendar('addEventSource', $scope.eventSource[calendar.url]);
			} else {
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEventSource', $scope.eventSource[calendar.url]);
				calendar.list.loading = false;
			}
		});

	}
]);
