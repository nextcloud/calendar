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
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$location', 'Calendar', 'CalendarService', 'VEventService', 'SettingsService', 'TimezoneService', 'VEvent', 'is', 'fc', 'EventsEditorDialogService', 'PopoverPositioningUtility', '$window', 'isPublic', 'constants',
	function ($scope, $location, Calendar, CalendarService, VEventService, SettingsService, TimezoneService, VEvent, is, fc, EventsEditorDialogService, PopoverPositioningUtility, $window, isPublic, constants) {
		'use strict';

		is.loading = true;

		$scope.calendars = [];
		$scope.eventSource = {};
		$scope.defaulttimezone = TimezoneService.current();
		$scope.eventModal = null;
		var switcher = [];

		$scope.$on('ready', () => {
			var autoOpenNewEvent = $location.search().hasOwnProperty('newevent');
			if (autoOpenNewEvent) {
				$scope.fcConfig.select(
					moment(),
					moment(),
					{}, // TODO(leon): Do we need this argument?
					fc.elm.fullCalendar('getView')
				);
			}
		});

		function showCalendar(url) {
			if (switcher.indexOf(url) === -1 && $scope.eventSource[url].isRendering === false) {
				switcher.push(url);
				fc.elm.fullCalendar(
					'removeEventSource',
					$scope.eventSource[url]);
				fc.elm.fullCalendar(
					'addEventSource',
					$scope.eventSource[url]);
			}
		}

		function hideCalendar(url) {
			fc.elm.fullCalendar(
				'removeEventSource',
				$scope.eventSource[url]);
			if (switcher.indexOf(url) !== -1) {
				switcher.splice(switcher.indexOf(url), 1);
			}
		}

		function createAndRenderEvent(calendar, data, start, end, tz) {
			VEventService.create(calendar, data).then(function(vevent) {
				if (calendar.enabled) {
					fc.elm.fullCalendar('refetchEventSources', calendar.fcEventSource);
				}
			});
		}

		function deleteAndRemoveEvent(vevent, fcEvent) {
			VEventService.delete(vevent).then(function() {
				fc.elm.fullCalendar('removeEvents', fcEvent.id);
			});
		}

		$scope.$watchCollection('calendars', function(newCalendars, oldCalendars) {
			newCalendars.filter(function(calendar) {
				return oldCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				$scope.eventSource[calendar.url] = calendar.fcEventSource;
				if (calendar.enabled) {
					showCalendar(calendar.url);
				}

				calendar.register(Calendar.hookEnabledChanged, function(enabled) {
					if (enabled) {
						showCalendar(calendar.url);
					} else {
						hideCalendar(calendar.url);
						//calendar.list.loading = false;
					}
				});

				calendar.register(Calendar.hookColorChanged, function() {
					if (calendar.enabled) {
						hideCalendar(calendar.url);
						showCalendar(calendar.url);
					}
				});
			});

			oldCalendars.filter(function(calendar) {
				return newCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				var url = calendar.url;
				hideCalendar(calendar.url);

				delete $scope.eventSource[url];
			});
		});



		TimezoneService.get($scope.defaulttimezone).then(function(timezone) {
			if (timezone) {
				ICAL.TimezoneService.register($scope.defaulttimezone, timezone.jCal);
			}
		}).catch(function() {
			OC.Notification.showTemporary(
				t('calendar', 'You are in an unknown timezone ({tz}), falling back to UTC', {
					tz: $scope.defaulttimezone
				})
			);

			$scope.defaulttimezone = 'UTC';
			$scope.fcConfig.timezone = 'UTC';
			fc.elm.fullCalendar('option', 'timezone', 'UTC');
		});

		if (!isPublic) {
			$scope.calendarsPromise = CalendarService.getAll().then(function (calendars) {
				$scope.calendars = calendars;
				is.loading = false;
				// TODO - scope.apply should not be necessary here
				$scope.$apply();
				$scope.$emit('ready');
			});
		} else {
			$scope.calendarsPromise = CalendarService.getPublicCalendar(constants.publicSharingToken).then(function(calendar) {
				$scope.calendars = [calendar];
				is.loading = false;
				// TODO - scope.apply should not be necessary here
				$scope.$apply();
				$scope.$emit('ready');
			}).catch((reason) => {
				angular.element('#header-right').css('display', 'none');
				angular.element('#emptycontent-container').css('display', 'block');
			});
		}


		/**
		 * Calendar UI Configuration.
		*/
		$scope.fcConfig = {
				timezone: $scope.defaulttimezone,
				select: function (start, end, jsEvent, view) {
					var writableCalendars = $scope.calendars.filter(function(elem) {
						return elem.isWritable();
					});

					if (writableCalendars.length === 0) {
						if (!isPublic) {
							OC.Notification.showTemporary(t('calendar', 'Please create a calendar first.'));
						}
						return;
					}

					start.add(start.toDate().getTimezoneOffset(), 'minutes');
					end.add(end.toDate().getTimezoneOffset(), 'minutes');

					var vevent = VEvent.fromStartEnd(start, end, $scope.defaulttimezone);
					vevent.calendar = writableCalendars[0];

					var timestamp = Date.now();
					var fcEventClass = 'new-event-dummy-' + timestamp;

					vevent.getFcEvent(view.start, view.end, $scope.defaulttimezone).then((fcEvents) => {
						const fcEvent = fcEvents[0];

						fcEvent.title = t('calendar', 'New event');
						fcEvent.className.push(fcEventClass);
						fcEvent.editable = false;
						fc.elm.fullCalendar('renderEvent', fcEvent);

						EventsEditorDialogService.open($scope, fcEvent, function() {
							const elements = angular.element('.' + fcEventClass);
							const isHidden = angular.element(elements[0]).parents('.fc-limited').length !== 0;
							if (isHidden) {
								return PopoverPositioningUtility.calculate(jsEvent.clientX, jsEvent.clientY, jsEvent.clientX, jsEvent.clientY, view);
							} else {
								return PopoverPositioningUtility.calculateByTarget(elements[0], view);
							}
						}, function() {
							return null;
						}, function() {
							fc.elm.fullCalendar('removeEvents', function(fcEventToCheck) {
								if (Array.isArray(fcEventToCheck.className)) {
									return (fcEventToCheck.className.indexOf(fcEventClass) !== -1);
								} else {
									return false;
								}
							});
						}).then(function(result) {
							createAndRenderEvent(result.calendar, result.vevent.data, view.start, view.end, $scope.defaulttimezone);
						}).catch(function(reason) {
							//fcEvent is removed by unlock callback
							//no need to anything
							return null;
						});
					});
				},
				eventClick: function(fcEvent, jsEvent, view) {
					var vevent = fcEvent.vevent;
					var oldCalendar = vevent.calendar;
					var fcEvt = fcEvent;

					EventsEditorDialogService.open($scope, fcEvent, function() {
						return PopoverPositioningUtility.calculateByTarget(jsEvent.currentTarget, view);
					}, function() {
						fcEvt.editable = false;
						fc.elm.fullCalendar('updateEvent', fcEvt);
					}, function() {
						fcEvt.editable = fcEvent.calendar.writable;
						fc.elm.fullCalendar('updateEvent', fcEvt);
					}).then(function(result) {
						// was the event moved to another calendar?
						if (result.calendar === oldCalendar) {
							VEventService.update(vevent).then(function() {
								fc.elm.fullCalendar('removeEvents', fcEvent.id);

								if (result.calendar.enabled) {
									fc.elm.fullCalendar('refetchEventSources', result.calendar.fcEventSource);
								}
							});
						} else {
							deleteAndRemoveEvent(vevent, fcEvent);
							createAndRenderEvent(result.calendar, result.vevent.data, view.start, view.end, $scope.defaulttimezone);
						}
					}).catch(function(reason) {
						if (reason === 'delete') {
							deleteAndRemoveEvent(vevent, fcEvent);
						}
					});
				},
				eventResize: function (fcEvent, delta, revertFunc) {
					fcEvent.resize(delta);
					VEventService.update(fcEvent.vevent).catch(function() {
						revertFunc();
					});
				},
				eventDrop: function (fcEvent, delta, revertFunc) {
					const isAllDay = !fcEvent.start.hasTime();

					const defaultAllDayEventDuration = fc.elm.fullCalendar('option', 'defaultAllDayEventDuration');
					const defaultAllDayEventMomentDuration = moment.duration(defaultAllDayEventDuration);

					const defaultTimedEventDuration = fc.elm.fullCalendar('option', 'defaultTimedEventDuration');
					const defaultTimedEventMomentDuration = moment.duration(defaultTimedEventDuration);

					const timezone = $scope.defaulttimezone;

					fcEvent.drop(delta, isAllDay, timezone, defaultTimedEventMomentDuration, defaultAllDayEventMomentDuration);
					VEventService.update(fcEvent.vevent).catch(function() {
						revertFunc();
					});
				},
				viewRender: function (view, element) {
					angular.element('#firstrow').find('.datepicker_current').html(view.title).text();
					angular.element('#datecontrol_date').datepicker('setDate', element.fullCalendar('getDate'));
					var newView = view.name;
					if (newView !== $scope.defaultView && !isPublic) {
						SettingsService.setView(newView);
						$scope.defaultView = newView;
					}
					if (newView === 'agendaDay') {
						angular.element('td.fc-state-highlight').css('background-color', '#ffffff');
					} else {
						angular.element('.fc-bg td.fc-state-highlight').css('background-color', '#ffa');
					}
					if (newView ==='agendaWeek') {
						element.fullCalendar('option', 'aspectRatio', 0.1);
					} else {
						element.fullCalendar('option', 'aspectRatio', 1.35);
					}
				},
				eventRender: function(event, element) {
					var status = event.getSimpleEvent().status;
					if (status !== null) {
						if (status.value === 'TENTATIVE') {
							element.css({'opacity': 0.5});
						}
						else if (status.value === 'CANCELLED') {
							element.css({
								'text-decoration': 'line-through',
								'opacity': 0.5
							});
						}
					}
				}
		};
	}
]);
