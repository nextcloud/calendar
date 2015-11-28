
/**
* Configuration / App Initialization File
*/

var app = angular.module('Calendar', [
	'restangular',
	'ngRoute',
	'ui.bootstrap',
	'ui.calendar'
]);

app.config(['$provide', '$routeProvider', 'RestangularProvider', '$httpProvider', '$windowProvider',
	function ($provide, $routeProvider, RestangularProvider, $httpProvider, $windowProvider) {
		'use strict';
		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

		$routeProvider.when('/', {
			templateUrl: 'calendar.html',
			controller: 'CalController'
		});

		var $window = $windowProvider.$get();
		var url = $window.location.href;
		var baseUrl = url.split('index.php')[0] + 'index.php/apps/calendar/v1';
		RestangularProvider.setBaseUrl(baseUrl);

		ICAL.design.defaultSet.property['x-oc-calid'] = {
			defaultType: "text"
		};
		ICAL.design.defaultSet.property['x-oc-cruds'] = {
			defaultType: "text"
		};
		ICAL.design.defaultSet.property['x-oc-uri'] = {
			defaultType: "text"
		};

		ICAL.design.defaultSet.param['x-oc-group-id'] = {
			allowXName: true
		};
	}
]);

app.run(['$rootScope', '$location', 'CalendarModel',
	function ($rootScope, $location, CalendarModel) {
		'use strict';
		$rootScope.$on('$routeChangeError', function () {
			var calendars = CalendarModel.getAll();
		});
}]);

app.controller('AppController', ['$scope', 'is',
	function ($scope, is) {
		'use strict';
		$scope.is = is;
	}
]);

/**
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel', 'ViewModel', 'TimezoneModel', 'fcHelper', 'objectConverter',
	function ($scope, $rootScope, Restangular, CalendarModel, ViewModel, TimezoneModel, fcHelper, objectConverter) {
		'use strict';

		$scope.eventSources = [];
		$scope.eventSource = {};
		$scope.calendarModel = CalendarModel;
		$scope.defaulttimezone = TimezoneModel.currenttimezone();
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

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window',
	'$routeParams', 'Restangular', 'CalendarModel', 'is',
	function ($scope, $rootScope, $window, $routeParams, Restangular, CalendarModel, is) {
		'use strict';

		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		$scope.backups = {};
		is.loading = true;

		var calendarResource = Restangular.all('calendars');
		calendarResource.getList().then( function (calendars) {
			is.loading = false;
			CalendarModel.addAll(calendars);
			$scope.calendars = CalendarModel.getAll();
			$rootScope.$broadcast('finishedLoadingCalendars', calendars);
		});

		$scope.newCalendarInputVal = '';

		$scope.create = function (name, color) {
			calendarResource.post({
				displayname: name,
				color: color,
				components: {
					vevent: true,
					vjournal: true,
					vtodo: true
				},
				enabled: true
			}).then(function (calendar) {
				CalendarModel.create(calendar);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('createdCalendar', calendar);
			});

			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
		};

		$scope.download = function (calendar) {
			$window.open('v1/calendars/' + calendar.id + '/export');
		};

		$scope.prepareUpdate = function (calendar) {
			$scope.backups[calendar.id] = angular.copy(calendar);
			calendar.list.edit = true;
		};

		$scope.cancelUpdate = function (calendar) {
			angular.forEach($scope.calendars, function(value, key) {
				if (value.id === calendar.id) {
					$scope.calendars[key] = angular.copy($scope.backups[calendar.id]);
					$scope.calendars[key].list.edit = false;
				}
			});
		};

		$scope.performUpdate = function (calendar) {
			Restangular.one('calendars', calendar.id).patch({
				displayname: calendar.displayname,
				color: calendar.color,
				components: angular.copy(calendar.components)
			}).then(function (updated) {
				CalendarModel.update(updated);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('updatedCalendar', updated);
			});
		};

		$scope.triggerEnable = function(c) {
			c.loading = true;
			var calendar = CalendarModel.get(c.id);
			var newEnabled = !calendar.enabled;
			calendar.patch({
				'enabled': newEnabled
			}).then(function (calendarObj) {
				CalendarModel.update(calendarObj);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('updatedCalendarsVisibility', calendarObj);
			});
		};

		$scope.remove = function (c) {
			c.loading = true;
			var calendar = CalendarModel.get(c.id);
			calendar.remove().then(function () {
				CalendarModel.remove(c.id);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('removedCalendar', c);
			});
		};

		//We need to reload the refresh the calendar-list,
		//if the user added a subscription
		$rootScope.$on('createdSubscription', function() {
			Restangular.all('calendars').getList().then(function (calendars) {
				var toAdd = [];
				for (var i = 0, length = calendars.length; i < length; i++) {
					var didFind = false;
					for (var j = 0, oldLength = $scope.calendars.length; j < oldLength; j++) {
						if (calendars[i].id === $scope.calendars[j].id) {
							didFind = true;
							break;
						}
					}
					if (!didFind) {
						toAdd.push(calendars[i]);
					}
				}

				for (var h = 0, toAddLength = toAdd.length; h < toAddLength; h++) {
					CalendarModel.create(toAdd[h]);
					$rootScope.$broadcast('createdCalendar', toAdd[h]);
				}

				$scope.calendars = CalendarModel.getAll();
			});
		});


		$rootScope.$on('finishedLoadingEvents', function(event, calendarId) {
			var calendar = CalendarModel.get(calendarId);
			calendar.loading = false;
			CalendarModel.update(calendar);
			$scope.calendars = CalendarModel.getAll();
		});
	}
]);

/**
* Controller: Date Picker Controller
* Description: Takes care for pushing dates from app navigation date picker and fullcalendar.
*/

app.controller('DatePickerController', ['$scope', 'CalendarModel',
	function ($scope, CalendarModel) {
		'use strict';

		// Changes the view for the month, week or daywise.
		$scope.changeview = function (view) {
			CalendarModel.pushtoggleview(view);
		};

		// Changes the view to Today's view.
		$scope.todayview = function (view) {
			CalendarModel.pushtoggleview(view);
		};

		// Changes the date to today on the datepicker.
		$scope.settodaytodatepicker = function () {
			CalendarModel.pushtodaydatepicker();
		};
	}
]);

/**
* Controller: Events Dialog Controller
* Description: Takes care of anything inside the Events Modal.
*/

app.controller('EventsModalController', ['$scope', '$templateCache','$rootScope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'DialogModel', 'Model', 'eventEditorHelper',
	function ($scope, $templateCache, $rootScope, $routeParams, Restangular, CalendarModel, TimezoneModel, DialogModel, Model, eventEditorHelper) {
		'use strict';
		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		$scope.properties = {};
		$scope.nameofattendee = '';
		$scope.eventsinfoview = true;
		$scope.selected = 1;

		$scope.tabs = [{
			title: t('Calendar', 'Events Info'), value: 1
		}, {
			title: t('Calendar', 'Attendees'), value: 2
		}, {
			title: t('Calendar', 'Alarms'), value: 3
		}];

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


		$scope.tabopener = function (val) {
			$scope.selected = val;
			if (val === 1) {
				$scope.eventsinfoview = true;
				$scope.eventsrepeatview = false;
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = false;
			}  else if (val === 2) {
				$scope.eventsinfoview = false;
				$scope.eventsrepeatview = false;
				$scope.eventsattendeeview = true;
				$scope.eventsalarmview = false;
			} else if (val === 3) {
				$scope.eventsinfoview = false;
				$scope.eventsrepeatview = false;
				$scope.eventsattendeeview = false;
				$scope.eventsalarmview = true;
			}

		};

		DialogModel.multiselect('#weeklyselect');

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

		$scope.getLocation = function() {
			return Restangular.one('autocompletion').getList('location',
				{ 'location': $scope.properties.location }).then(function(res) {
					var locations = [];
					angular.forEach(res, function(item) {
						locations.push(item.label);
					});
					return locations;
				});
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

		$scope.addmoreattendees = function (val) {
			var attendee = val;
			if (attendee !== '') {
				$scope.properties.attendee.push({
					value: attendee,
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



		$scope.update = function () {
			var moment_start = moment(angular.element('#from').datepicker('getDate'));
			var moment_end = moment(angular.element('#to').datepicker('getDate'));

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';

				moment_end.add(1, 'days');

				$scope.properties.dtstart.time = '00:00:00';
				$scope.properties.dtend.time = '00:00:00';
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';

				var moment_start_time = moment(angular.element('#fromtime').timepicker('getTimeAsDate'));
				var moment_end_time = moment(angular.element('#totime').timepicker('getTimeAsDate'));

				$scope.properties.dtstart.time = moment_start_time.format('HH:mm:ss');
				$scope.properties.dtend.time = moment_end_time.format('HH:mm:ss');

				//TODO - make sure the timezones are loaded!!!!1111OneOneEleven
			}
			$scope.properties.dtstart.date = moment_start.format('YYYY-MM-DD');
			$scope.properties.dtend.date = moment_end.format('YYYY-MM-DD');

			$scope.onSuccess($scope.properties);
		};



		$rootScope.$on('initializeEventEditor', function(event, obj) {
			eventEditorHelper.prepareProperties(obj.data);

			$scope.properties = obj.data;
			$scope.onSuccess = obj.onSuccess;

			var moment_start = moment(obj.data.dtstart.date, 'YYYY-MM-DD');
			var moment_end = moment(obj.data.dtend.date, 'YYYY-MM-DD');

			var midnight = new Date('2000-01-01 00:00');
			if (obj.data.dtstart.type === 'date') {
				angular.element('#fromtime').timepicker('setTime', midnight);
			} else {
				var fromTime = new Date('2000-01-01 ' + obj.data.dtstart.time);
				angular.element('#fromtime').timepicker('setTime', fromTime);
			}

			if (obj.data.dtend.type === 'date') {
				moment_end.subtract(1, 'days');
				angular.element('#totime').timepicker('setTime', midnight);
			} else {
				var toTime = new Date('2000-01-01 ' + obj.data.dtend.time);
				angular.element('#totime').timepicker('setTime', toTime);
			}

			angular.element('#from').datepicker('setDate', moment_start.toDate());
			angular.element('#to').datepicker('setDate', moment_end.toDate());

			DialogModel.initbig('#events');
			DialogModel.open('#events');
		});

		// TODO: If this can be taken to Model better do that.
		var localeData = moment.localeData();

		// TODO: revaluate current solution:
		// moment.js and the datepicker use different formats to format a date.
		// therefore we have to do some conversion-black-magic to make the moment.js
		// local formats work with the datepicker.
		// THIS HAS TO BE TESTED VERY CAREFULLY
		// WE NEED A SHORT UNIT TEST IDEALLY FOR ALL LANGUAGES SUPPORTED
		// maybe move setting the date format into a try catch block
		angular.element('#from').datepicker({
			dateFormat : localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
			monthNames: moment.months(),
			monthNamesShort: moment.monthsShort(),
			dayNames: moment.weekdays(),
			dayNamesMin: moment.weekdaysMin(),
			dayNamesShort: moment.weekdaysShort(),
			firstDay: localeData.firstDayOfWeek(),
			minDate: null
		});
		angular.element('#to').datepicker({
			dateFormat : localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
			monthNames: moment.months(),
			monthNamesShort: moment.monthsShort(),
			dayNames: moment.weekdays(),
			dayNamesMin: moment.weekdaysMin(),
			dayNamesShort: moment.weekdaysShort(),
			firstDay: localeData.firstDayOfWeek(),
			minDate: null
		});

		angular.element('#fromtime').timepicker({
			showPeriodLabels: false,
			showLeadingZero: true,
			showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1)
		});
		angular.element('#totime').timepicker({
			showPeriodLabels: false,
			showLeadingZero: true,
			showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1)
		});

		angular.element('#absolutreminderdate').datepicker({
			dateFormat : 'dd-mm-yy'
		});
		angular.element('#absolutremindertime').timepicker({
			showPeriodLabels: false
		});

		$templateCache.put('event.info.html', function () {
			angular.element('#from').datepicker({
				dateFormat : 'dd-mm-yy'
			});
		});
	}
]);

/**
 * Controller: SettingController
 * Description: Takes care of the Calendar Settings.
 */

app.controller('SettingsController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel','UploadModel', 'DialogModel',
	function ($scope, $rootScope, Restangular, CalendarModel, UploadModel, DialogModel) {
		'use strict';

		$scope.settingsCalDavLink = OC.linkToRemote('caldav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('caldav') + '/principals/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';

		// have to use the native HTML call for filereader to work efficiently

		var reader = new FileReader();

		$('#import').on('change', function () {
			$scope.calendarAdded(this);
		});

		$scope.calendarAdded = function (elem) {
			$scope.files = elem.files;
			$scope.$apply();
			DialogModel.initsmall('#importdialog');
			DialogModel.open('#importdialog');
		};

		$scope.import = function (file) {
			var reader = new FileReader();
			file.isImporting = true;

			reader.onload = function() {
				Restangular.one('calendars', file.importToCalendar).withHttpConfig({transformRequest: angular.identity}).customPOST(
						reader.result,
						'import',
						undefined,
						{
							'Content-Type': 'text/calendar'
						}
				).then( function () {
					file.done = true;
				}, function (response) {
					OC.Notification.show(t('calendar', response.data.message));
				});
			};

			reader.readAsText(file);
		};

		//to send a patch to add a hidden event again
		$scope.enableCalendar = function (id) {
			Restangular.one('calendars', id).patch({ 'components' : {'vevent' : true }});
		};
	}
]);

/**
* Controller: SubscriptionController
* Description: Takes care of Subscription List in the App Navigation.
*/

app.controller('SubscriptionController', ['$scope', '$rootScope', '$window', 'SubscriptionModel', 'CalendarModel', 'Restangular',
	function ($scope, $rootScope, $window, SubscriptionModel, CalendarModel, Restangular) {
		'use strict';
		
		$scope.subscriptions = SubscriptionModel.getAll();
		var subscriptionResource = Restangular.all('subscriptions');

		var backendResource = Restangular.all('backends');
		backendResource.getList().then(function (backendObject) {
			$scope.subscriptiontypeSelect = SubscriptionModel.getSubscriptionNames(backendObject);
			$scope.selectedsubscriptionbackendmodel = $scope.subscriptiontypeSelect[0]; // to remove the empty model.
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		$scope.newSubscriptionUrl = '';

		$scope.create = function () {
			subscriptionResource.post({
				type: $scope.selectedsubscriptionbackendmodel.type,
				url: $scope.newSubscriptionUrl
			}).then(function (newSubscription) {
				SubscriptionModel.create(newSubscription);
				$rootScope.$broadcast('createdSubscription', {
					subscription: newSubscription
				});
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});

			$scope.newSubscriptionUrl = '';
		};
	}
]);

/**
* Directive: Colorpicker
* Description: Colorpicker for the Calendar app.
*/


app.directive('colorpicker', function() {
  'use strict';
    var listofcolours =  [
        '#21213D',
        '#253151',
        '#9C909D',
        '#3A3B3D',
        '#FF7A66',
        '#009CFC',
        '#F1DB50',
        '#CC317C'
    ];
    return {
        scope: {
            selected: '=',
            customizedColors: '=colors'
        },
        restrict: 'AE',
        templateUrl: OC.filePath('calendar','js/app/directives', 'colorpicker.html'),
        link: function (scope, element, attr) {
            scope.colors = scope.customizedColors || listofcolours;
            scope.selected = scope.selected || scope.colors[0];

            scope.pick = function (color) {
                scope.selected = color;
            };

        }
    };

});

/**
* Directive: Loading
* Description: Can be used to incorperate loading behavior, anywhere.
*/

app.directive('loading',
	[ function () {
		'use strict';
		return {
			restrict: 'E',
			replace: true,
			template: "<div id='loading' class='icon-loading'></div>",
			link: function ($scope, element, attr) {
				$scope.$watch('loading', function (val) {
					if (val) {
						$(element).show();
					}
					else {
						$(element).hide();
					}
				});
			}
		};
	}]
);

/**
* Controller: Modal
* Description: The jQuery Model ported to angularJS as a directive.
*/

app.directive('openDialog', function() {
	'use strict';
	return {
		restrict: 'A',
		link: function(scope, elem, attr, ctrl) {
			var dialogId = '#' + attr.openDialog;
			elem.bind('click', function(e) {
				$(dialogId).dialog('open');
			});
		}
	};
});

app.filter('calendareventFilter',
	[ function () {
		'use strict';
		var calendareventfilter = function (item) {
			var filter = [];
			if (item.length > 0) {
				for (var i = 0; i < item.length; i++) {
					if (item[i].cruds.create === true) {
						filter.push(item[i]);
					}
				}
			}
			return filter;
		};
		return calendareventfilter;
	}]
);

app.filter('calendarFilter',
	[ function () {
		'use strict';
		var calendarfilter = function (item) {
			var filter = [];
			if (item.length > 0) {
				for (var i = 0; i < item.length; i++) {
					if (item[i].cruds.create === true || item[i].cruds.update === true || item[i].cruds.delete === true) {
						filter.push(item[i]);
					}
				}
			}
			return filter;
		};
		return calendarfilter;
	}
	]);

app.filter('eventFilter',
	[ function () {
		'use strict';
		var eventfilter = function (item) {
			var filter = [];
			if (item.length > 0) {
				for (var i = 0; i < item.length; i++) {
					if (item[i].components.vevent === true) {
						filter.push(item[i]);
					}
				}
			}
			return filter;
		};
		return eventfilter;
	}
	]
);

app.filter('noteventFilter',
	[ function () {
		'use strict';
		var noteventfilter = function (item) {
			var filter = [];
			if (item.length > 0) {
				for (var i = 0; i < item.length; i++) {
					if (item[i].components.vevent === false) {
						filter.push(item[i]);
					}
				}
			}
			return filter;
		};
		return noteventfilter;
	}
	]
);

app.filter('simpleReminderDescription', function() {
	'use strict';
	var actionMapper = {
		AUDIO: t('calendar', 'Audio alarm'),
		DISPLAY: t('calendar', 'Pop-up'),
		EMAIL: t('calendar', 'E-Mail')
	};

	function getActionName(alarm) {
		var name = alarm.action.value;
		if (name && actionMapper.hasOwnProperty(name)) {
			return actionMapper[name];
		} else {
			return name;
		}
	}

	return function(alarm) {
		var relative = alarm.trigger.type === 'duration';
		var relatedToStart = alarm.trigger.related === 'start';

		if (relative) {
			var timeString = moment.duration(Math.abs(alarm.trigger.value), 'seconds').humanize();
			if (alarm.trigger.value < 0) {
				if (relatedToStart) {
					return t('calendar', '{type} {time} before the event starts', {type: getActionName(alarm), time: timeString});
				} else {
					return t('calendar', '{type} {time} before the event ends', {type: getActionName(alarm), time: timeString});
				}
			} else if (alarm.trigger.value > 0) {
				if (relatedToStart) {
					return t('calendar', '{type} {time} after the event starts', {type: getActionName(alarm), time: timeString});
				} else {
					return t('calendar', '{type} {time} after the event ends', {type: getActionName(alarm), time: timeString});
				}
			} else {
				if (relatedToStart) {
					return t('calendar', '{type} at the event\'s start', {type: getActionName(alarm)});
				} else {
					return t('calendar', '{type} at the event\'s end', {type: getActionName(alarm)});
				}
			}
		} else {
			return t('{type} at {time}', {type: getActionName(alarm), time: alarm.trigger.value.format()});
		}
	};
});

app.filter('subscriptionFilter',
	[ function () {
		'use strict';
		
		var subscriptionfilter = function (item) {
			var filter = [];
			if (item.length > 0) {
				for (var i = 0; i < item.length; i++) {
					if (item[i].cruds.create === false && item[i].cruds.update === false && item[i].cruds.delete === false) {
						filter.push(item[i]);
					}
				}
			}
			return filter;
		};
		return subscriptionfilter;
	}
	]);

/**
* Model:
* Description: Generates a random uid.
*/

app.factory('Model', function () {
	'use strict';
	var Model = function () {
		this.text = '';
		this.possible = '';
	};

	Model.prototype = {
		uidgen: function () {
			this.possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for (var i = 0; i < 5; i++) {
				this.text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return this.text;
		}
	};

	return new Model();
});

/**
* Model: Calendar
* Description: Required for Calendar Sharing.
*/

app.factory('CalendarModel', function () {
	'use strict';
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
		this.firstday = {};
		this.modelview = {
			id: '',
			view: ''
		};
		this.updated = null;
		this.datepickerview = {
			id: '',
			view: ''
		};
		this.today = {
			id: '',
			date: new Date()
		};
		this.activator = {
			id: '',
			bool: ''
		};
		this.created = null;
		this.deleted = null;
		this.date = new Date();
	};

	var addListProperty = function(calendar) {
		calendar.list = {
			showCalDav: false,
			calDavLink: OC.linkToRemote('caldav') + '/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/' + escapeHTML(encodeURIComponent(calendar.uri)),
			edit: false,
			locked: false
		};
	};

	CalendarModel.prototype = {
		create: function (newCalendar) {
			addListProperty(newCalendar);

			this.calendars.push(newCalendar);
			this.calendarId[newCalendar.id] = newCalendar;
			this.created = newCalendar;
		},
		addAll: function (calendars) {
			this.reset();
			for (var i = 0; i < calendars.length; i++) {
				addListProperty(calendars[i]);
				this.calendars.push(calendars[i]);
				this.calendarId[calendars[i].id] = calendars[i];
			}
		},
		getAll: function () {
			return this.calendars;
		},
		get: function (id) {
			for (var i = 0; i <this.calendars.length; i++) {
				if (id === this.calendars[i].id) {
					this.calendarId[id] = this.calendars[i];
					break;
				}
			}
			return this.calendarId[id];
		},
		update: function(calendar) {
			addListProperty(calendar);

			for (var i = 0; i < this.calendars.length; i++) {
				if (this.calendars[i].id === calendar.id) {
					this.calendars[i] = calendar;
					break;
				}
			}

			this.calendarId[calendar.id] = calendar;
			this.updated = calendar;
		},
		remove: function (id) {
			for (var i = 0; i < this.calendars.length; i++) {
				if (this.calendars[i].id === id) {
					this.calendars.splice(i, 1);
					delete this.calendarId[id];
					this.deleted = {
						id: id
					};
					break;
				}
			}
		},
		pushdatepickerview: function (view, date) {
			this.datepickerview.id = Math.random(1000);
			this.datepickerview.view = view;
		},
		pushtoggleview: function (view) {
			this.modelview.id = Math.random(1000);
			this.modelview.view = view;
		},
		pushtodaydatepicker: function () {
			this.today.id = Math.random(1000);
		},
		pushdate: function (date) {
			this.date = date;
		},
		pushfirstday: function (val) {
			this.firstday = moment().day(val).day();
		},
		toggleactive: function (id,bool) {
			this.activator.id = id;
			this.activator.bool = bool;
		},
		updatecalendar: function (updated) {
			this.updated = updated;
		},
		reset: function() {
			this.calendars = [];
			this.calendarId = {};
		}
	};

	return new CalendarModel();
});

/**
* Model: Dialog
* Description: For Dialog Properties.
*/

app.factory('DialogModel', function() {
	'use strict';

	return {
		initsmall: function(elementId) {
			$(elementId).dialog({
				width : 400,
				height: 300,
				resizable: false,
				draggable: true,
				close : function(event, ui) {
					$(this).dialog('destroy');
				}
			});
		},
		initbig: function (elementId) {
			$(elementId).dialog({
				width : 500,
				height: 400,
				resizable: false,
				draggable: true,
				close : function(event, ui) {
					$(this).dialog('destroy');
				}
			});
		},
		open: function (elementId) {
			$(elementId).dialog('open');
		},
		close: function (elementId) {
			$(elementId).dialog('close');
		},
		multiselect: function (elementId) {
			this.checked = [];
			$(elementId).multiSelect({
				minWidth: 300,
				createCallback: false,
				createText: false,
				singleSelect: false,
				checked: this.checked,
				labels:[]
			});
		},
		checkedarraymultiselect : function () {
			return this.checked;
		}
	};
});

app.factory('eventEditorHelper', function () {
	'use strict';

	var alarmFactors = [
		60,
		60,
		24,
		7
	];

	var alarmDropdownValues = [
		0,
		-1 * 5 * 60,
		-1 * 10 * 60,
		-1 * 15 * 60,
		-1 * 30 * 60,
		-1 * 60 * 60,
		-1 * 2 * 60 * 60
	];
	
	/**
	 * prepare alarm
	 */
	function prepareAlarm(alarm) {
		alarm.editor = {};
		alarm.editor.reminderSelectValue = (alarmDropdownValues.indexOf(alarm.trigger.value) !== -1) ? alarm.trigger.value.toString() : 'custom';

		alarm.editor.triggerType = (alarm.trigger.type === 'duration') ? 'relative' : 'absolute';
		if (alarm.editor.triggerType === 'relative') {
			var triggerValue = Math.abs(alarm.trigger.value);

			alarm.editor.triggerBeforeAfter = (alarm.trigger.value < 0) ? -1 : 1;
			alarm.editor.triggerTimeUnit = 1;

			for (var i = 0; i < alarmFactors.length && triggerValue !== 0; i++) {
				var mod = triggerValue % alarmFactors[i];
				if (mod !== 0) {
					break;
				}

				alarm.editor.triggerTimeUnit *= alarmFactors[i];
				triggerValue /= alarmFactors[i];
			}

			alarm.editor.triggerTimeUnit = alarm.editor.triggerTimeUnit.toString();
			alarm.editor.triggerValue = triggerValue;
		} else {
			alarm.editor.triggerValue = 0;
			alarm.editor.triggerBeforeAfter = -1;
			alarm.editor.triggerTimeUnit = 1;
		}

		if (alarm.editor.triggerType === 'absolute') {
			alarm.editor.absDate = alarm.trigger.value.format('L');
			alarm.editor.absTime = alarm.trigger.value.format('LT');
		} else {
			alarm.editor.absDate = '';
			alarm.editor.absTime = '';
		}

		alarm.editor.repeat = !(!alarm.repeat.value || alarm.repeat.value === 0);
		alarm.editor.repeatNTimes = (alarm.editor.repeat) ? alarm.repeat.value : 0;
		alarm.editor.repeatTimeUnit = 1;

		var repeatValue = (alarm.duration && alarm.duration.value) ? alarm.duration.value : 0;

		for (var i2 = 0; i2 < alarmFactors.length && repeatValue !== 0; i2++) {
			var mod2 = repeatValue % alarmFactors[i2];
			if (mod2 !== 0) {
				break;
			}

			alarm.editor.repeatTimeUnit *= alarmFactors[i2];
			repeatValue /= alarmFactors[i2];
		}

		alarm.editor.repeatNValue = repeatValue;
	}

	/**
	 * prepare attendee
	 */
	function prepareAttendee(attendee) {

	}

	return {
		prepareAlarm: prepareAlarm,
		prepareProperties: function(simpleData) {
			if(Object.getOwnPropertyNames(simpleData).length !== 0) {
				if (simpleData.calendar !== '') {
					//prepare alarms
					angular.forEach(simpleData.alarm, function(value, key) {
						var alarm = simpleData.alarm[key];
						prepareAlarm(alarm);
					});

					//prepare attendees
					angular.forEach(simpleData.attendee, function(value, key) {
						var attendee = simpleData.attendee[key];
						prepareAttendee(attendee);
					});
				}
			}
		}
	};
});
app.factory('fcHelper', function () {
	'use strict';

	/**
	 * check if vevent is the one described in event
	 * @param {Object} event
	 * @param {Object} vevent
	 * @returns {boolean}
	 */
	function isCorrectEvent(event, vevent) {
		if (event.objectUri !== vevent.getFirstPropertyValue('x-oc-uri')) {
			return false;
		}

		if (event.recurrenceId === null) {
			if (!vevent.hasProperty('recurrence-id')) {
				return true;
			}
		} else {
			if (event.recurrenceId === vevent.getFirstPropertyValue('recurrence-id').toICALString()) {
				return true;
			}
		}

		return false;
	}

	/**
	 * get DTEND from vevent
	 * @param {object} vevent
	 * @returns {ICAL.Time}
	 */
	function calculateDTEnd(vevent) {
		if (vevent.hasProperty('dtend')) {
			return vevent.getFirstPropertyValue('dtend');
		} else if (vevent.hasProperty('duration')) {
			return vevent.getFirstPropertyValue('dtstart').clone();
		} else {
			return vevent.getFirstPropertyValue('dtstart').clone();
		}
	}

	/**
	 * register timezones from ical response
	 * @param components
	 */
	function registerTimezones(components) {
		var vtimezones = components.getAllSubcomponents('vtimezone');
		angular.forEach(vtimezones, function (vtimezone) {
			var timezone = new ICAL.Timezone(vtimezone);
			ICAL.TimezoneService.register(timezone.tzid, timezone);
		});
	}

	/**
	 * adds data about the calendar to the fcData object
	 * @param fcData
	 * @param calendar
	 * @returns {*}
	 */
	function addCalendarDataToFCData(fcData, calendar) {
		fcData.calendarId = calendar.id;
		fcData.color = calendar.color;
		fcData.textColor = calendar.textColor;
		fcData.editable = calendar.editable;
		fcData.className = 'fcCalendar-id-' + calendar.id;

		return fcData;
	}

	/**
	 * Adds data about the event to the fcData object
	 * @param fcData
	 * @param vevent
	 * @param event
	 * @returns {*}
	 */
	function addEventDataToFCData(fcData, vevent, event) {
		fcData.objectUri = vevent.getFirstPropertyValue('x-oc-uri');
		fcData.etag = vevent.getFirstPropertyValue('x-oc-etag');
		fcData.title = vevent.getFirstPropertyValue('summary');

		if (event.isRecurrenceException()) {
			fcData.recurrenceId = vevent
				.getFirstPropertyValue('recurrence-id')
				.toICALString();
			fcData.id = event.objectUri + event.recurrenceId;
		} else {
			fcData.recurrenceId = null;
			fcData.id = fcData.objectUri;
		}

		return fcData;
	}

	/**
	 * check if we need to convert the timezone of either dtstart or dtend
	 * @param dt
	 * @returns {boolean}
	 */
	function isTimezoneConversionNecessary(dt) {
		return (dt.icaltype !== 'date' &&
		dt.zone !== ICAL.Timezone.utcTimezone &&
		dt.zone !== ICAL.Timezone.localTimezone);
	}

	/**
	 * check if dtstart and dtend are both of type date
	 * @param dtstart
	 * @param dtend
	 * @returns {boolean}
	 */
	function isEventAllDay(dtstart, dtend) {
		return (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
	}

	/**
	 * parse an recurring event
	 * @param vevent
	 * @param start
	 * @param end
	 * @param timezone
	 * @return []
	 */
	function parseTimeForRecurringEvent(vevent, start, end, timezone) {
		var dtstart = vevent.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(vevent);
		var duration = dtend.subtractDate(dtstart);
		var fcDataContainer = [];

		var iterator = new ICAL.RecurExpansion({
			component: vevent,
			dtstart: dtstart
		});

		var next;
		while ((next = iterator.next())) {
			if (next.compare(start) < 0) {
				continue;
			}
			if (next.compare(end) > 0) {
				break;
			}

			var dtstartOfRecurrence = next.clone();
			var dtendOfRecurrence = next.clone();
			dtendOfRecurrence.addDuration(duration);

			if (isTimezoneConversionNecessary(dtstartOfRecurrence)) {
				dtstartOfRecurrence = dtstartOfRecurrence.convertToZone(timezone);
			}
			if (isTimezoneConversionNecessary(dtendOfRecurrence)) {
				dtendOfRecurrence = dtendOfRecurrence.convertToZone(timezone);
			}

			fcDataContainer.push({
				allDay: isEventAllDay(dtstartOfRecurrence, dtendOfRecurrence),
				start: dtstartOfRecurrence.toJSDate(),
				end: dtendOfRecurrence.toJSDate(),
				repeating: true
			});
		}

		return fcDataContainer;
	}

	/**
	 * parse a single event
	 * @param vevent
	 * @param timezone
	 * @returns {object}
	 */
	function parseTimeForSingleEvent(vevent, timezone) {
		var dtstart = vevent.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(vevent);

		if (isTimezoneConversionNecessary(dtstart)) {
			dtstart = dtstart.convertToZone(timezone);
		}
		if (isTimezoneConversionNecessary(dtend)) {
			dtend = dtend.convertToZone(timezone);
		}

		return {
			allDay: isEventAllDay(dtstart, dtend),
			start: dtstart.toJSDate(),
			end: dtend.toJSDate(),
			repeating: false
		};
	}

	return {
		/**
		 * render a jCal string
		 * @param calendar
		 * @param jCalData
		 * @param start
		 * @param end
		 * @param timezone
		 * @param renderCallback a callback that is called for each rendered event
		 * @returns {Array}
		 */
		renderJCAL: function(calendar, jCalData, start, end, timezone, renderCallback) {
			var components = new ICAL.Component(jCalData);

			start = new ICAL.Time();
			start.fromUnixTime(start);
			end = new ICAL.Time();
			end.fromUnixTime(end);

			if (components.jCal.length === 0) {
				return null;
			}

			registerTimezones(components);

			var vevents = components.getAllSubcomponents('vevent');

			angular.forEach(vevents, function (vevent) {
				var event = new ICAL.Event(vevent);
				var fcData;

				try {
					if (!vevent.hasProperty('dtstart')) {
						return;
					}
					if (event.isRecurring()) {
						fcData = parseTimeForRecurringEvent(vevent, start, end, timezone);
					} else {
						fcData = [];
						fcData.push(parseTimeForSingleEvent(vevent, timezone));
					}
				} catch(e) {
					console.log(e);
				}

				if (typeof fcData === 'undefined') {
					return;
				}

				for (var i = 0, length = fcData.length; i < length; i++) {
					fcData[i] = addCalendarDataToFCData(fcData[i], calendar);
					fcData[i] = addEventDataToFCData(fcData[i], vevent, event);

					renderCallback(fcData[i]);
				}
			});

			return [];
		},

		/**
		 * resize an event
		 * @param event
		 * @param delta
		 * @param jCalData
		 * @returns {*}
		 */
		resizeEvent: function(event, delta, jCalData) {
			var components = new ICAL.Component(jCalData);
			var vevents = components.getAllSubcomponents('vevent');
			var foundEvent = false;
			var deltaAsSeconds = 0;
			var duration = null;
			var propertyToUpdate = null;

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					deltaAsSeconds = delta.asSeconds();
					duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);

					if (vevents[i].hasProperty('duration')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('duration');
						duration.fromSeconds((duration.toSeconds() + propertyToUpdate.toSeconds()));
						vevents[i].updatePropertyWithValue('duration', duration);
					} else if (vevents[i].hasProperty('dtend')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
					} else if (vevents[i].hasProperty('dtstart')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart').clone();
						propertyToUpdate.addDuration(duration);
						vevents[i].addPropertyWithValue('dtend', propertyToUpdate);
					} else {
						continue;
					}

					components.addSubcomponent(vevents[i]);
					foundEvent = true;
				}
			}

			return (foundEvent) ? components.toString() : null;
		},

		/**
		 * drop an event
		 * @param event
		 * @param delta
		 * @param jCalData
		 * @returns {*}
		 */
		dropEvent: function(event, delta, jCalData) {
			var components = new ICAL.Component(jCalData);
			var vevents = components.getAllSubcomponents('vevent');
			var foundEvent = false;
			var deltaAsSeconds = 0;
			var duration = null;
			var propertyToUpdate = null;

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					deltaAsSeconds = delta.asSeconds();
					duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);

					if (vevents[i].hasProperty('dtstart')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtstart', propertyToUpdate);

					}

					if (vevents[i].hasProperty('dtend')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
					}

					components.addSubcomponent(vevents[i]);
					foundEvent = true;
				}
			}

			return (foundEvent) ? components.toString() : null;
		},

		/**
		 *
		 * @param event
		 * @param jCalData
		 */
		getCorrectEvent: function(event, jCalData) {
			var components = new ICAL.Component(jCalData);
			var vevents = components.getAllSubcomponents('vevent');

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					return vevents[i];
				}
			}

			return null;
		}
	 };
 });
app.factory('is', function () {
	'use strict';

	return {
		loading: false
	};
});

app.factory('objectConverter', function () {
	'use strict';

	/**
	 * structure of simple data
	 */
	var defaults = {
		'summary': null,
		'x-oc-calid': null,
		'location': null,
		'created': null,
		'last-modified': null,
		'organizer': null,
		'x-oc-cruds': null,
		'class': null,
		'description': null,
		'url': null,
		'status': null,
		'resources': null,
		'alarm': null,
		'attendee': null,
		'categories': null,
		'dtstart': null,
		'dtend': null,
		'repeating': null,
		'rdate': null,
		'rrule': null,
		'exdate': null
	};

	var attendeeParameters = [
		'role',
		'rvsp',
		'partstat',
		'cutype',
		'cn',
		'delegated-from',
		'delegated-to'
	];

	/**
	 * parsers of supported properties
	 */
	var simpleParser = {
		date: function(data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseSingle(data, vevent, key, parameters, function(p) {
				return (p.type === 'duration') ?
						p.getFirstValue().toSeconds() :
						p.getFirstValue().toJSDate();
			});
		},
		dates: function(data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseMultiple(data, vevent, key, parameters, function(p) {
				var values = p.getValues(),
					usableValues = [];
				for (var vKey in values) {
					if (!values.hasOwnProperty(vKey)) {
						continue;
					}

					usableValues.push(
						(p.type === 'duration') ?
							values[vKey].toSeconds() :
							values[vKey].toJSDate()
					);
				}

				return usableValues;
			});
		},
		string: function(data, vevent, key, parameters) {
			simpleParser._parseSingle(data, vevent, key, parameters, function(p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		strings: function(data, vevent, key, parameters) {
			simpleParser._parseMultiple(data, vevent, key, parameters, function(p) {
				return p.isMultiValue ? p.getValues() : p.getFirstValue();
			});
		},
		_parseSingle: function(data, vevent, key, parameters, valueParser) {
			var prop = vevent.getFirstProperty(key);
			if (!prop) {
				return;
			}

			data[key] = {
				parameters: simpleParser._parseParameters(prop, parameters),
				type: prop.type
			};

			if (prop.isMultiValue) {
				angular.extend(data[key], {
					values: valueParser(prop)
				});
			} else {
				angular.extend(data[key], {
					value: valueParser(prop)
				});
			}
		},
		_parseMultiple: function(data, vevent, key, parameters, valueParser) {
			data[key] = data[key] || [];

			var properties = vevent.getAllProperties(key),
					group = 0;

			for (var pKey in properties) {
				if (!properties.hasOwnProperty(pKey)) {
					continue;
				}

				var values = valueParser(properties[pKey]);
				var currentElement = {
					group: group,
					parameters: simpleParser._parseParameters(properties[pKey], parameters),
					type: properties[pKey].type,
					values: values
				};

				if (properties[pKey].isMultiValue) {
					angular.extend(currentElement, {
						values: valueParser(properties[pKey])
					});
				} else {
					angular.extend(currentElement, {
						value: valueParser(properties[pKey])
					});
				}

				data[key].push(currentElement);
				properties[pKey].setParameter('x-oc-group-id', group.toString());
				group++;
			}
		},
		_parseParameters: function(prop, para) {
			var parameters = {};

			if (!para) {
				return parameters;
			}

			for (var i=0,l=para.length; i < l; i++) {
				parameters[para[i]] = prop.getParameter(para[i]);
			}

			return parameters;
		}
	};

	var simpleReader = {
		date: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				if (v.type === 'duration') {
					return ICAL.Duration.fromSeconds(v.value);
				} else {
					return ICAL.Time.fromJSDate(v.value);
				}
			});
		},
		dates: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				var values = [];

				for (var i=0, length=v.values.length; i < length; i++) {
					if (v.type === 'duration') {
						values.push(ICAL.Duration.fromSeconds(v.values[i]));
					} else {
						values.push(ICAL.Time.fromJSDate(v.values[i]));
					}
				}

				return values;
			});
		},
		string: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readSingle(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		strings: function(vevent, oldSimpleData, newSimpleData, key, parameters) {
			simpleReader._readMultiple(vevent, oldSimpleData, newSimpleData, key, parameters, function(v, isMultiValue) {
				return isMultiValue ? v.values : v.value;
			});
		},
		_readSingle: function(vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			if (!newSimpleData[key]) {
				return;
			}
			if (!newSimpleData[key].hasOwnProperty('value') && !newSimpleData[key].hasOwnProperty('values')) {
				return;
			}
			var isMultiValue = newSimpleData[key].hasOwnProperty('values');

			var prop = vevent.updatePropertyWithValue(key, valueReader(newSimpleData[key], isMultiValue));
			simpleReader._readParameters(prop, newSimpleData[key], parameters);
		},
		_readMultiple: function(vevent, oldSimpleData, newSimpleData, key, parameters, valueReader) {
			var oldGroups=[], properties=null, pKey=null, groupId;

			oldSimpleData[key] = oldSimpleData[key] || [];
			for (var i=0, oldLength=oldSimpleData[key].length; i < oldLength; i++) {
				oldGroups.push(oldSimpleData[key][i].group);
			}

			newSimpleData[key] = newSimpleData[key] || [];
			for (var j=0, newLength=newSimpleData[key].length; j < newLength; j++) {
				var isMultiValue = newSimpleData[key][j].hasOwnProperty('values');
				var value = valueReader(newSimpleData[key][j], isMultiValue);

				if (oldGroups.indexOf(newSimpleData[key][j].group) === -1) {
					var property = new ICAL.Property(key);
					simpleReader._setProperty(property, value, isMultiValue);
					simpleReader._readParameters(property, newSimpleData[key][j], parameters);
					vevent.addProperty(property);
				} else {
					oldGroups.splice(oldGroups.indexOf(newSimpleData[key][j].group), 1);

					properties = vevent.getAllProperties(key);
					for (pKey in properties) {
						if (!properties.hasOwnProperty(pKey)) {
							continue;
						}

						groupId = properties[pKey].getParameter('x-oc-group-id');
						if (groupId === null) {
							continue;
						}
						if (groupId === newSimpleData[key][j].group) {
							simpleReader._setProperty(properties[pKey], value, isMultiValue);
							simpleReader._readParameters(properties[pKey], newSimpleData[key][j], parameters);
						}
					}
				}
			}

			properties = vevent.getAllProperties(key);
			for (pKey in properties) {
				if (!properties.hasOwnProperty(pKey)) {
					continue;
				}

				groupId = properties[pKey].getParameter('x-oc-group-id');
				if (groupId === null) {
					continue;
				}
				if (oldGroups.indexOf(groupId) !== -1) {
					delete properties[pKey];
				}
			}
		},
		_readParameters: function(prop, simple, para) {
			if (!para) {
				return;
			}
			if (!simple.parameters) {
				return;
			}

			for (var i=0,l=para.length; i < l; i++) {
				if (simple.parameters[para[i]]) {
					prop.setParameter(para[i], simple.parameters[para[i]]);
				} else {
					prop.removeParameter(simple.parameters[para[i]]);
				}
			}
		},
		_setProperty: function(prop, value, isMultiValue) {
			if (isMultiValue) {
				prop.setValues(value);
			} else {
				prop.setValue(value);
			}
		}
	};

	/**
	 * properties supported by event editor
	 */
	var simpleProperties = {
		//General
		'summary': {parser: simpleParser.string, reader: simpleReader.string},
		'x-oc-calid': {parser: simpleParser.string, reader: simpleReader.string},
		'location': {parser: simpleParser.string, reader: simpleReader.string},
		'created': {parser: simpleParser.date, reader: simpleReader.date},
		'last-modified': {parser: simpleParser.date, reader: simpleReader.date},
		'categories': {parser: simpleParser.strings, reader: simpleReader.strings},
		//attendees
		'attendee': {parser: simpleParser.strings, reader: simpleReader.strings, parameters: attendeeParameters},
		'organizer': {parser: simpleParser.string, reader: simpleReader.string},
		//sharing
		'x-oc-cruds': {parser: simpleParser.string, reader: simpleReader.string},
		'class': {parser: simpleParser.string, reader: simpleReader.string},
		//other
		'description': {parser: simpleParser.string, reader: simpleReader.string},
		'url': {parser: simpleParser.string, reader: simpleReader.string},
		'status': {parser: simpleParser.string, reader: simpleReader.string},
		'resources': {parser: simpleParser.strings, reader: simpleReader.strings}
	};

	function addZero(t) {
		if (t < 10) {
			t = '0' + t;
		}
		return t;
	}

	function formatDate(d) {
		return d.getFullYear() + '-' +
			addZero(d.getMonth()) + '-' +
			addZero(d.getDate());
	}

	function formatTime(d) {
		return addZero(d.getHours()) + ':' +
			addZero(d.getMinutes()) + ':' +
			addZero(d.getSeconds());

	}

	/**
	 * specific parsers that check only one property
	 */
	var specificParser = {
		alarm: function(data, vevent) {
			data.alarm = data.alarm || [];

			var alarms = vevent.getAllSubcomponents('valarm'),
				group = 0;
			for (var key in alarms) {
				if (!alarms.hasOwnProperty(key)) {
					continue;
				}

				var alarm = alarms[key];
				var alarmData = {
					group: group,
					action: {},
					trigger: {},
					repeat: {},
					duration: {},
					attendee: []
				};

				simpleParser.string(alarmData, alarm, 'action');
				simpleParser.date(alarmData, alarm, 'trigger');
				simpleParser.string(alarmData, alarm, 'repeat');
				simpleParser.string(alarmData, alarm, 'duration');
				simpleParser.strings(alarmData, alarm, 'attendee', attendeeParameters);

				if (alarm.hasProperty('trigger')) {
					var trigger = alarm.getFirstProperty('trigger');
					var related = trigger.getParameter('related');
					if (related) {
						alarmData.trigger.related = related;
					} else {
						alarmData.trigger.related = 'start';
					}
				}

				data.alarm.push(alarmData);

				alarm.getFirstProperty('action')
					.setParameter('x-oc-group-id', group.toString());
				group++;
			}
		},
		date: function(data, vevent) {
			var dtstart = vevent.getFirstPropertyValue('dtstart');
			var dtend;

			if (vevent.hasProperty('dtend')) {
				dtend = vevent.getFirstPropertyValue('dtend');
			} else if (vevent.hasProperty('duration')) {
				dtend = dtstart.clone();
				dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
			} else {
				dtend = dtstart.clone();
			}

			data.dtstart = {
				date: formatDate(dtstart.toJSDate()),
				time: formatTime(dtstart.toJSDate()),
				type: dtstart.icaltype,
				zone: dtstart.zone.toString()
			};
			data.dtend = {
				date: formatDate(dtend.toJSDate()),
				time: formatTime(dtend.toJSDate()),
				type: dtend.icaltype,
				zone: dtend.zone.toString()
			};
			data.allDay = (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
		},
		repeating: function(data, vevent) {
			var iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();
			simpleParser.dates(data, vevent, 'rdate');
			simpleParser.string(data, vevent, 'rrule');

			simpleParser.dates(data, vevent, 'exdate');
		}
	};

	var specificReader = {
		alarm: function(vevent, oldSimpleData, newSimpleData) {
			var oldGroups=[], components=null, cKey=null, groupId, key='alarm';

			oldSimpleData[key] = oldSimpleData[key] || [];
			for (var i=0, oldLength=oldSimpleData[key].length; i < oldLength; i++) {
				oldGroups.push(oldSimpleData[key][i].group);
			}

			newSimpleData[key] = newSimpleData[key] || [];
			for (var j=0, newLength=newSimpleData[key].length; j < newLength; j++) {
				var valarm;
				if (oldGroups.indexOf(newSimpleData[key][j].group) === -1) {
					valarm = new ICAL.Component('VALARM');
					vevent.addSubcomponent(valarm);
				} else {
					oldGroups.splice(oldGroups.indexOf(newSimpleData[key][j].group), 1);


					components = vevent.getAllSubcomponents('VALARM');
					for (cKey in components) {
						if (!components.hasOwnProperty(cKey)) {
							continue;
						}

						groupId = components[cKey].getFirstProperty('action').getParameter('x-oc-group-id');
						if (groupId === null) {
							continue;
						}
						if (groupId === newSimpleData[key][j].group) {
							valarm = components[cKey];
						}
					}
				}

				simpleReader.string(valarm, {}, newSimpleData[key][j], 'action', []);
				simpleReader.date(valarm, {}, newSimpleData[key][j], 'trigger', []);
				simpleReader.string(valarm, {}, newSimpleData[key][j], 'repeat', []);
				simpleReader.string(valarm, {}, newSimpleData[key][j], 'duration', []);
				simpleReader.strings(valarm, {}, newSimpleData[key][j], 'attendee', attendeeParameters);
			}
		},
		date: function(vevent, oldSimpleData, newSimpleData) {
			delete vevent.dstart;
			delete vevent.dtend;
			delete vevent.duration;

			var parseIntWrapper = function(str) {
				return parseInt(str);
			};

			if (!ICAL.TimezoneService.has(newSimpleData.dtstart.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtstart.zone
				};
			}
			if (!ICAL.TimezoneService.has(newSimpleData.dtend.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtend.zone
				};
			}

			var dtstartDateParts = newSimpleData.dtstart.date.split('-').map(parseIntWrapper);
			var dtstartTimeParts = newSimpleData.dtstart.time.split(':').map(parseIntWrapper);
			var dtstartTz = ICAL.TimezoneService.get(newSimpleData.dtstart.zone);
			var start = new ICAL.Time({
				year: dtstartDateParts[0],
				month: dtstartDateParts[1],
				day: dtstartDateParts[2],
				hour: dtstartTimeParts[0],
				minute: dtstartTimeParts[1],
				second: dtstartTimeParts[2],
				isDate: newSimpleData.allDay
			}, dtstartTz);

			var dtendDateParts = newSimpleData.dtend.date.split('-').map(parseIntWrapper);
			var dtendTimeParts = newSimpleData.dtend.time.split(':').map(parseIntWrapper);
			var dtendTz = ICAL.TimezoneService.get(newSimpleData.dtend.zone);
			var end = new ICAL.Time({
				year: dtendDateParts[0],
				month: dtendDateParts[1],
				day: dtendDateParts[2],
				hour: dtendTimeParts[0],
				minute: dtendTimeParts[1],
				second: dtendTimeParts[2],
				isDate: newSimpleData.allDay
			}, dtendTz);

			var dtstart = new ICAL.Property('dtstart', vevent);
			dtstart.setValue(start);
			dtstart.setParameter('tzid', dtstartTz.tzid);
			var dtend = new ICAL.Property('dtend', vevent);
			dtend.setValue(end);
			dtend.setParameter('tzid', dtendTz.tzid);

			vevent.addProperty(dtstart);
			vevent.addProperty(dtend);
		},
		repeating: function(vevent, oldSimpleData, newSimpleData) {
			// We won't support exrule, because it's deprecated and barely used in the wild
			if (newSimpleData.repeating === false) {
				delete vevent.rdate;
				delete vevent.rrule;
				delete vevent.exdate;

				return;
			}

			simpleReader.dates(vevent, oldSimpleData, newSimpleData, 'rdate');
			simpleReader.string(vevent, oldSimpleData, newSimpleData, 'rrule');
			simpleReader.dates(vevent, oldSimpleData, newSimpleData, 'exdate');
		}
	};

	return {
		/**
		 * parse and expand jCal data to simple structure
		 * @param vevent object to be parsed
		 * @returns {{}}
		 */
		parse: function(vevent) {
			var data=angular.extend({}, defaults), parser, parameters;

			for (parser in specificParser) {
				if (!specificParser.hasOwnProperty(parser)) {
					continue;
				}

				specificParser[parser](data, vevent);
			}

			for (var key in simpleProperties) {
				if (!simpleProperties.hasOwnProperty(key)) {
					continue;
				}

				parser = simpleProperties[key].parser;
				parameters = simpleProperties[key].parameters;
				if (vevent.hasProperty(key)) {
					parser(data, vevent, key, parameters);
				}
			}

			return data;
		},

		/**
		 * patch vevent with data from event editor
		 * @param vevent object to update
		 * @param oldSimpleData
		 * @param newSimpleData
		 * @returns {*}
		 */
		patch: function(vevent, oldSimpleData, newSimpleData) {
			var key, reader, parameters;

			oldSimpleData = angular.extend({}, defaults, oldSimpleData);
			newSimpleData = angular.extend({}, defaults, newSimpleData);

			for (key in simpleProperties) {
				if (!simpleProperties.hasOwnProperty(key)) {
					continue;
				}

				reader = simpleProperties[key].reader;
				parameters = simpleProperties[key].parameters;
				if (oldSimpleData[key] !== newSimpleData[key]) {
					if (newSimpleData === null) {
						delete vevent[key];
					} else {
						reader(vevent, oldSimpleData, newSimpleData, key, parameters);
					}
				}
			}

			for (key in specificReader) {
				if (!specificReader.hasOwnProperty(key)) {
					continue;
				}

				reader = specificReader[key];
				reader(vevent, oldSimpleData, newSimpleData);
			}
		}
	};
});

/**
* Model: Subscriptions
* Description: Required for Subscription Sharing.
*/

app.factory('SubscriptionModel', function () {
	'use strict';
	var SubscriptionModel = function () {
		this.subscriptions = [];
		this.subscriptionId = {};
		this.subscriptionDetails = [];
	};

	SubscriptionModel.prototype = {
		create: function (newsubscription) {
			this.subscriptions.push(newsubscription);
		},
		add: function (subscription) {
			this.updateIfExists(subscription);
		},
		addAll: function (subscriptions) {
			for (var i = 0; i < subscriptions.length; i++) {
				this.add(subscriptions[i]);
			}
		},
		getAll: function () {
			return this.subscriptions;
		},
		get: function (id) {
			return this.subscriptionId[id];
		},
		updateIfExists: function (updated) {
			var subscription = this.subscriptionId[updated.id];
			if (!angular.isDefined(subscription)) {
				this.subscriptions.push(updated);
				this.subscriptionId[updated.id] = updated;
			}
		},
		remove: function (id) {
			for (var i = 0; i < this.subscriptions.length; i++) {
				var subscription = this.subscriptions[i];
				if (subscription.id === id) {
					this.subscriptions.splice(i, 1);
					delete this.subscriptionId[id];
					break;
				}
			}
		},
		getSubscriptionNames: function (backends) {
			var _this = this;

			angular.forEach(backends, function(backend) {
				angular.forEach(backend.subscriptions, function(subscription) {
					_this.subscriptionDetails.push({
						name: subscription.name,
						type: subscription.type
					});
				});
			});

			return this.subscriptionDetails;
		}
	};

	return new SubscriptionModel();
});

/**
* Model: Timezone
* Description: Required for Setting timezone.
*/

app.factory('TimezoneModel', function () {
	'use strict';

	var TimezoneModel = function () {
		this.timezones = [];
		this.timezoneslist = [];
		this.timezoneId = {};
	};

	TimezoneModel.prototype = {
		add: function (timezone) {
			this.timezones.push(timezone);
		},
		addAll: function (timezones) {
			for (var i = 0; i < timezones.length; i++) {
				this.add(timezones[i]);
			}
		},
		getAll: function () {
			return this.timezones;
		},
		get: function (id) {
			return this.timezoneId[id];
		},
		delete: function (id) {
			return 0;
		},
		currenttimezone: function () {
			var timezone = jstz.determine();
			return timezone.name();
		},
		addtimezone: function (timezonedata) {
			var rawdata = new ICAL.Component(timezonedata);
			var vtimezones = rawdata.getAllSubcomponents('vtimezone');
			var timezone = [];
			ICAL.TimezoneService.reset();
			angular.forEach(vtimezones, function (value, key) {
				timezone = new ICAL.Timezone(value);
				ICAL.TimezoneService.register(timezone.tzid, timezone);
			});
			return timezone;
		}
	};

	return new TimezoneModel();
});

/**
* Model: Upload
* Description: Required for Uploading / Importing Files.
*/

app.factory('UploadModel', ["$rootScope", function ($rootScope) {
	'use strict';
	
	var _files = [];
	return {
		add: function (file) {
			_files.push(file);
			$rootScope.$broadcast('fileAdded', file.files[0].name);
		},
		clear: function () {
			_files = [];
		},
		files: function () {
			var fileNames = [];
			$.each(_files, function (index, file) {
				fileNames.push(file.files[0].name);
			});
			return fileNames;
		},
		upload: function () {
			$.each(_files, function (index, file) {
				file.submit();
			});
			this.clear();
		},
		setProgress: function (percentage) {
			$rootScope.$broadcast('uploadProgress', percentage);
		}
	};
}]);

/**
* Model: View
* Description: Sets the full calendarview.
*/

app.factory('ViewModel', function () {
	'use strict';
	var ViewModel = function () {
		this.view = [];
	};

	ViewModel.prototype = {
		add: function (views) {
			this.view.push(views);
		}
	};

	return new ViewModel();
});

