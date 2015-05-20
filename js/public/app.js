
/**
* Configuration / App Initialization File
*/

var app = angular.module('Calendar', [
	'OC',
	'ngAnimate',
	'restangular',
	'ngRoute',
	'ui.bootstrap',
	'ui.calendar',
	'colorpicker.module'
]).config(['$provide', '$routeProvider', 'RestangularProvider', '$httpProvider', '$windowProvider',
	function ($provide, $routeProvider, RestangularProvider, $httpProvider, $windowProvider) {

		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

		$routeProvider.when('/', {
			templateUrl: 'calendar.html',
			controller: 'CalController',
			resolve: {
				calendar: ['$q', 'Restangular', 'CalendarModel', 'is',
					function ($q, Restangular, CalendarModel,is) {
						var deferred = $q.defer();
						is.loading = true;
						Restangular.all('calendars').getList().then(function (calendars) {
							CalendarModel.addAll(calendars);
							deferred.resolve(calendars);
							is.loading = false;
						}, function () {
							deferred.reject();
							is.loading = false;
						});
						return deferred.promise;
					}],
			}
		});

		var $window = $windowProvider.$get();
		var url = $window.location.href;
		var baseUrl = url.split('index.php')[0] + 'index.php/apps/calendar/v1';
		RestangularProvider.setBaseUrl(baseUrl);
	}
]).run(['$rootScope', '$location', 'CalendarModel', 'EventsModel',
	function ($rootScope, $location, CalendarModel, EventsModel) {
		$rootScope.$on('$routeChangeError', function () {
			var calendars = CalendarModel.getAll();
			var events = EventsModel.getAll();
		});
	}]);

app.controller('AppController', ['$scope', 'is',
	function ($scope, is) {
		$scope.is = is;
	}
]);
/**
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel', 'EventsModel', 'ViewModel', 'TimezoneModel', 'DialogModel',
	function ($scope, $rootScope, Restangular, CalendarModel, EventsModel, ViewModel, TimezoneModel, DialogModel) {

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
					initEventSources.push($scope.eventSource[value.id]);
					switcher.push(value.id);
				}
			}
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
			monthNames.push(moment.localeData().months(moment([0, i]), ""));
			monthNamesShort.push(moment.localeData().monthsShort(moment([0, i]), ""));
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
				eventSources: initEventSources,
				timezone: $scope.defaulttimezone,
				defaultView: $scope.defaultView,
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

			if (updatedCalendar.enabled === true && index == -1) {
				$scope.calendar.fullCalendar('addEventSource',
					$scope.eventSource[id]);
				switcher.push(id);
			}
			//Events are already visible -> loading finished
			if (updatedCalendar.enabled === true && index != -1) {
				$rootScope.$broadcast('finishedLoadingEvents', updatedCalendar.id);
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
	}
]);

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window',
	'$routeParams', 'Restangular', 'CalendarModel',
	function ($scope, $rootScope, $window, $routeParams, Restangular, CalendarModel) {

		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		$scope.backups = {};

		var calendarResource = Restangular.all('calendars');

		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

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
				CalendarModel.addAll(calendars);
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

app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'DialogModel', 'Model',
	function ($scope, $routeParams, Restangular, CalendarModel, TimezoneModel, EventsModel, DialogModel, Model) {
		
		$scope.eventsmodel = EventsModel;
		$scope.calendarListSelect = CalendarModel.getAll();

		$scope.properties = {
			calcolor: '',
			title : '',
			location : '',
			categories : '',
			description : '',
			attendees : [],
			alarms : []
		};

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
								if (mod !== 0) {
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

						for (var i2 = 0; i2 < factors.length && repeatValue !== 0; i2++) {
							var mod2 = repeatValue % factors[i2];
							if (mod2 !== 0) {
								break;
							}

							alarm.editor.repeatTimeUnit *= factors[i2];
							repeatValue /= factors[i2];
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
			$scope.attendeeoptions = false;
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
				alarm.trigger.type = 'date-time';
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
/**
* Controller: SettingController
* Description: Takes care of the Calendar Settings.
*/

app.controller('SettingsController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel','UploadModel', 'DialogModel',
	function ($scope, $rootScope, Restangular, CalendarModel, UploadModel, DialogModel) {

		$scope.files = [];

		$scope.settingsCalDavLink = OC.linkToRemote('caldav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('caldav') + '/principals/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';

		// have to use the native HTML call for filereader to work efficiently
		var importinput = document.getElementById('import');
		var reader = new FileReader();

		$scope.upload = function () {
			UploadModel.upload();
			$scope.files = [];
		};

		$rootScope.$on('fileAdded', function (e, call) {
			$scope.files.push(call);
			$scope.$apply();
			if ($scope.files.length > 0) {
				var file = importinput.files[0];
				reader.onload = function(e) {
					$scope.filescontent = reader.result;
				};
				reader.readAsText(file);
				DialogModel.initsmall('#importdialog');
				DialogModel.open('#importdialog');
			}
			$scope.$digest(); // TODO : Shouldn't digest reset scope for it to be implemented again and again?
		});

		$scope.importcalendar = function (id) {
			$scope.calendarid = id;
		};

		$scope.pushcalendar = function (id, index) {
			Restangular.one('calendars', id).withHttpConfig({transformRequest: angular.identity}).customPOST(
				$scope.filescontent,
				'import',
				undefined,
				{
					'Content-Type': 'text/calendar'
				}
			).then( function () {
				$scope.files.splice(index,1);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		$scope.removecalendar = function (index) {
			$scope.files.splice(index,1);
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

app.controller('SubscriptionController', ['$scope', '$rootScope', '$window', 'SubscriptionModel', 'CalendarModel', 'EventsModel', 'Restangular',
	function ($scope, $rootScope, $window, SubscriptionModel, CalendarModel, EventsModel, Restangular) {

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
* Directive: Loading
* Description: Can be used to incorperate loading behavior, anywhere.
*/

app.directive('loading',
	[ function () {
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

app.directive('openDialog', function(){
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
app.directive('upload', ['UploadModel', function factory(UploadModel) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			$(element).fileupload({
				dataType: 'text',
				add: function (e, data) {
					UploadModel.add(data);
				},
				progressall: function (e, data) {
					var progress = parseInt(data.loaded / data.total * 100, 10);
					UploadModel.setProgress(progress);
				},
				done: function (e, data) {
					UploadModel.setProgress(0);
				}
			});
		}
	};
}]);

/**
* Model:
* Description: Generates a random uid.
*/

app.factory('Model', function () {
	var Model = function () {
		this.text = '';
		this.possible = '';
	};

	Model.prototype = {
		uidgen: function () {
			this.possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
				if (id == this.calendars[i].id) {
					this.calendarId = this.calendars[i];
					break;
				}
			}
			return this.calendarId;
		},
		update: function(calendar) {
			addListProperty(calendar);

			for (var i = 0; i < this.calendars.length; i++) {
				if (this.calendars[i].id == calendar.id) {
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
				height: 435,
				resizable: false,
				draggable: true,
				close : function(event, ui) {
					$(this).dialog('destroy');
				}
			});
		},
		open: function (elementId) {
			$(elementId).dialog('open');
		}
	};
});
/**
* Model: Events
* Description: Required for Calendar Sharing.
*/

app.factory('EventsModel', ['objectConverter', function (objectConverter) {
	var EventsModel = function () {
		this.events = [];
		this.eventsUid = {};
		this.eventobject = {};
		this.calid = {
			id: '',
			changer: ''
		}; // required for switching the calendars on the fullcalendar
		this.components = {};
		this.vevents = {};
		this.eventsmodalproperties = {
			"event": '',
			"jsEvent": '',
			"view": ''
		};
	};


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

	EventsModel.prototype = {
		create: function (newevent) {
			var rawdata = new ICAL.Event();
			this.events.push(rawdata);
		},
		addAllDisplayFigures: function (calendarId, calendardisplayname, calendarcolor, jcalData, start, end, timezone) {
			var components = new ICAL.Component(jcalData);
			var events = [];

			var dtstart = '';
			var dtend = '';
			var etag = '';
			var eventsId = '';
			var uri = '';
			var recurrenceId = null;
			var isAllDay = false;

			var iCalTimeStart = new ICAL.Time();
			iCalTimeStart.fromUnixTime(start);
			var iCalTimeEnd = new ICAL.Time();
			iCalTimeEnd.fromUnixTime(end);

			if (components.jCal.length !== 0) {
				var vtimezones = components.getAllSubcomponents("vtimezone");
				angular.forEach(vtimezones, function (vtimezone) {
					var timezone = new ICAL.Timezone(vtimezone);
					ICAL.TimezoneService.register(timezone.tzid, timezone);
				});

				var vevents = components.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (vevent) {
					try {
						var iCalEvent = new ICAL.Event(vevent);
						var event = {
							"calendardisplayname": calendardisplayname,
							"calendarcolor": calendarcolor,
							"calendarId": calendarId
						};

						event.objectUri = vevent.getFirstPropertyValue('x-oc-uri');
						event.etag = vevent.getFirstPropertyValue('x-oc-etag');
						event.title = vevent.getFirstPropertyValue('summary');

						if (iCalEvent.isRecurrenceException()) {
							event.recurrenceId = vevent
								.getFirstPropertyValue('recurrence-id')
								.toICALString();
							event.id = event.objectUri + event.recurrenceId;
						} else {
							event.recurrenceId = null;
							event.id = event.objectUri;
						}

						if (!vevent.hasProperty('dtstart')) {
							return;
						}
						dtstart = vevent.getFirstPropertyValue('dtstart');

						if (vevent.hasProperty('dtend')) {
							dtend = vevent.getFirstPropertyValue('dtend');
						} else if (vevent.hasProperty('duration')) {
							dtend = dtstart.clone();
							dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
						} else {
							dtend = dtstart.clone();
						}

						if (iCalEvent.isRecurring()) {
							var iterator = new ICAL.RecurExpansion({
								component: vevent,
								dtstart: dtstart
							});

							var duration = dtend.subtractDate(dtstart);

							var next;
							while ((next = iterator.next())) {
								if (next.compare(iCalTimeStart) === -1) {
									continue;
								}
								if (next.compare(iCalTimeEnd) === 1) {
									break;
								}

								dtstart = next.clone();
								dtend = next.clone();
								dtend.addDuration(duration);

								if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
									dtstart.convertToZone(timezone);
								}
								if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
									dtend.convertToZone(timezone);
								}

								isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

								var newEvent = JSON.parse(JSON.stringify(event));
								newEvent.start = dtstart.toJSDate();
								newEvent.end = dtend.toJSDate();
								newEvent.allDay = isAllDay;

								events.push(newEvent);
							}
						} else {
							if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
								dtstart = dtstart.convertToZone(timezone);
							}

							if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
								dtend = dtend.convertToZone(timezone);
							}

							isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

							event.start = dtstart.toJSDate();
							event.end = dtend.toJSDate();
							event.allDay = isAllDay;

							events.push(event);
						}
					} catch(e) {
						console.warn('');
						console.warn('Error in calendar:');
						console.warn(calendardisplayname);
						console.warn(e.message);
						console.warn('');
						//console.log(e.stack);
					}
				});
			}
			return events;
		},
		eventResizer: function (event, delta, jcalData) {
			var components = new ICAL.Component(jcalData);
			var vevents = components.getAllSubcomponents('vevent');
			var didFindEvent = false;
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
					didFindEvent = true;
				}
			}

			return (didFindEvent) ? components.toString() : null;
		},
		eventDropper: function (event, delta, jcalData) {
			var components = new ICAL.Component(jcalData);
			var vevents = components.getAllSubcomponents('vevent');
			var didFindEvent = false;
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
					didFindEvent = true;
				}
			}

			return (didFindEvent) ? components.toString() : null;
		},
		modalpropertyholder: function (event, jsEvent, view, jcalData) {
			this.components = new ICAL.Component(jcalData);
			this.vevents = this.components.getAllSubcomponents('vevent');
			if (this.components.jCal.length !== 0) {
				for (var i = 0; i < this.vevents.length; i++) {
					if (!isCorrectEvent(event, this.vevents[i])) {
						this.components.addSubcomponent(vevents[i]);
						continue;
					}
					var data = objectConverter.parse(this.vevents[i]);
					console.log(data);
					this.addeventobjectcontent(data);
				}
			}
		},
		addeventobjectcontent: function (data) {
			this.eventobject = data;
		},
		addattendee: function (attendee) {
			this.components.removeAllSubcomponents('vevent');

			if (this.components.jCal.length !== 0) {
				for (var i = 0; i < this.vevents.length; i++) {
					console.log(this.vevents[i]);
					console.log(attendee);
					//if (!isCorrectEvent(event, this.vevents[i])) {
					//	this.components.addSubcomponent(this.vevents[i]);
					//	continue;
					//}

					var property = new ICAL.Property('attendee');

					property.setParameter('ROLE', 'REQ-PARTICIPANT');
					property.setParameter('RVSP', true);
					property.setParameter('PARTSTAT', 'NEEDS-ACTION');
					property.setParameter('CUTYPE', 'INDIVIDUAL');
					property.setParameter('X-OC-SENTMAIL', false);

					property.setValue('email addr');

					console.log(property.toJSON());
				}
			}
		},
		updateevent : function (updated) {
			console.log(updated);
		},
		addEvent: function (id) {
			this.calid.changer = Math.random(1000);
			this.calid.id = id;
		},
		getAll: function () {
			return this.events;
		},
		remove: function (id) {
			delete this.id;
		}
	};

	return new EventsModel();
}]);
app.factory('is', function () {
	return {
		loading: false,
		calendarloading: function (id) {
		}
	};
});
app.factory('objectConverter', function () {

	/**
	 * parsers of supported properties
	 */
	var simpleParser = {
		date: function(data, vevent, multiple, key, propName) {
			var prop;

			if (multiple) {
				simpleParser._createArray(data, key);

				var properties = vevent.getAllProperties(propName);
				var id = 0;
				var group = 0;
				for (prop in properties) {
					prop = properties[prop];
					if (!prop) {
						continue;
					}

					var values = prop.getValues();
					for (var value in values) {
						value = values[value];
						if (prop.type === 'duration') {
							data[key].push({
								'id': id,
								'group': group,
								'type': prop.type,
								'value': value.toSeconds()
							});
						} else {
							data[key].push({
								'id': id,
								'group': group,
								'type': prop.type,
								'value': value.toJSDate()
							});
						}
					}
					id = 0;
					group++;
				}
			} else {
				prop = vevent.getFirstProperty(propName);

				if (prop) {
					if (prop.type === 'duration') {
						data[key] = {
							type: prop.type,
							value: prop.getFirstValue().toSeconds()
						};
					} else {
						data[key] = {
							type: prop.type,
							value: prop.getFirstValue().toJSDate()
						};
					}
				}
			}
		},
		string: function(data, vevent, multiple, key, propName) {
			var prop;

			if (multiple) {
				simpleParser._createArray(data, key);

				var properties = vevent.getAllProperties(propName);
				var id = 0;
				var group = 0;
				for (prop in properties) {
					prop = properties[prop];
					var values = prop.getValues();
					for (var value in values) {
						value = values[value];
						data[key].push({
							id: id,
							group: group,
							type: prop.type,
							value: value
						});
						id++;
					}
					id = 0;
					group++;
				}
			} else {
				prop = vevent.getFirstProperty(propName);
				if (prop) {
					data[key] = {
						type: prop.type,
						value: prop.getFirstValue()
					};
				}
			}
		},
		_createArray: function(data, key) {
			if (!Array.isArray(data[key])) {
				data[key] = [];
			}
		}
	};

	/**
	 * properties supported by event editor
	 */
	var simpleProperties = {
		//General
		summary: {jName: 'summary', multiple: false, parser: simpleParser.string},
		calendarid: {jName: 'x-oc-calid', multiple: false, parser: simpleParser.string},
		location: {jName: 'location', multiple: false, parser: simpleParser.string},
		created: {jName: 'created', multiple: false, parser: simpleParser.date},
		lastModified: {jName: 'last-modified', multiple: false, parser: simpleParser.date},
		//attendees
		organizer: {jName: 'organizer', multiple: false, parser: simpleParser.string},
		//sharing
		permission: {jName: 'x-oc-cruds', multiple: false, parser: simpleParser.string},
		privacyClass: {jName: 'class', multiple: false, parser: simpleParser.string},
		//other
		description: {jName: 'description', multiple: false, parser: simpleParser.string},
		url: {jName: 'url', multiple: false, parser: simpleParser.string},
		status: {jName: 'status', multiple: false, parser: simpleParser.string},
		resources: {jName: 'resources', multiple: true, parser: simpleParser.string}
	};

	/**
	 * specific parsers that check only one property
	 */
	var specificParser = {
		alarm: function(data, vevent) {
			if (!Array.isArray(data.alarm)) {
				data.alarms = [];
			}

			var alarms = vevent.getAllSubcomponents('valarm');
			var id;
			for (id in alarms) {
				var alarm = alarms[id];
				var alarmData = {
					id: id,
					action: {},
					trigger: {},
					repeat: {},
					duration: {},
				};

				simpleParser.string(alarmData, alarm, false, 'action', 'action');
				simpleParser.date(alarmData, alarm, false, 'trigger', 'trigger');
				simpleParser.string(alarmData, alarm, false, 'repeat', 'repeat');
				simpleParser.date(alarmData, alarm, false, 'duration', 'duration');
				specificParser.attendee(alarmData, alarm);

				if (alarm.hasProperty('trigger')) {
					var trigger = alarm.getFirstProperty('trigger');
					var related = trigger.getParameter('related');
					if (related) {
						alarmData.trigger.related = related;
					} else {
						alarmData.trigger.related = 'start';
					}
				}

				data.alarms.push(alarmData);
			}
		},
		attendee: function(data, vevent) {
			simpleParser._createArray(data, 'attendees');

			var attendees = vevent.getAllProperties('attendee');
			var id;
			for (id in attendees) {
				var attendee = attendees[id];
				data.attendees.push({
					id: id,
					type: attendee.type,
					value: attendee.getFirstValue(),
					props: {
						role: attendee.getParameter('role'),
						rvsp: attendee.getParameter('rvsp'),
						partstat: attendee.getParameter('partstat'),
						cutype: attendee.getParameter('cutype'),
						sentmail: attendee.getParameter('x-oc-sentmail')
					}
				});
			}
		},
		categories: function(data, vevent) {
			simpleParser._createArray(data, 'categories');

			var categories = vevent.getAllProperties('categories');
			var id = 0;
			var group = 0;
			for (var category in categories) {
				var values = category.getValues();
				for (var value in values) {
					data.attendees.push({
						id: id,
						group: group,
						type: category.type,
						value: value
					});
					id++;
				}
				id = 0;
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

			data.start = {
				type: dtstart.icaltype,
				value: dtstart.toJSDate
			};
			data.startzone = {
				type: 'string',
				value: dtstart.zone
			};
			data.end = {
				type: dtend.icaltype,
				value: dtend.toJSDate
			};
			data.endzone = {
				type: 'string',
				value: dtend.zone
			};
			data.allDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');
		},
		geo: function(data, vevent) {
			/*
			ICAL.js issue here - need to report bug or even better send a pr
			var value = vevent.getFirstPropertyValue('geo');
			var parts = value.split(';');

			data.geo = {
				lat: parts[0],
				long: parts[1]
			};*/
		},
		repeating: function(data, vevent) {
			var iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();
			simpleParser.date(data, vevent, true, 'rdate', 'rdate');
			simpleParser.string(data, vevent, true, 'rrule', 'rrule');

			simpleParser.date(data, vevent, true, 'exdate', 'exdate');
			simpleParser.string(data, vevent, true, 'exrule', 'exrule');
		}
	};

	//public functions
	/**
	 * parse and expand jCal data to simple structure
	 * @param vevent object to be parsed
	 * @returns {{}}
	 */
	var parse = function(vevent) {
		var data = {};

		for (var parser in specificParser) {
			if (!specificParser.hasOwnProperty(parser)) {
				continue;
			}

			specificParser[parser](data, vevent);
		}

		for (var key in simpleProperties) {
			if (!simpleProperties.hasOwnProperty(key)) {
				continue;
			}

			var prop = simpleProperties[key];
			if (vevent.hasProperty(prop.jName)) {
				prop.parser(data, vevent, prop.multiple, key, prop.jName);
			}
		}

		return data;
	};


	/**
	 * patch vevent with data from event editor
	 * @param vevent object to update
	 * @param data patched data
	 * @returns {*}
	 */
	var patch = function(vevent, data) {
		//TO BE IMPLEMENTED
	};

	return {
		parse: parse,
		patch: patch
	};
});
/**
* Model: Subscriptions
* Description: Required for Subscription Sharing.
*/ 

app.factory('SubscriptionModel', function () {
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
			if (angular.isDefined(subscription)) {

			} else {
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
			var vtimezones = rawdata.getAllSubcomponents("vtimezone");
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

app.factory('UploadModel', function ($rootScope) {
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
});
/**
* Model: View
* Description: Sets the full calendarview.
*/

app.factory('ViewModel', function () {
	var ViewModel = function () {
		this.view = [];
		this.viewId = {};
	};

	ViewModel.prototype = {
		add: function (views) {
			this.view.push(views);
		},
		addAll: function (views) {
			for (var i = 0; i < views.length; i++) {
				this.add(views[i]);
			}
		},
		getAll: function () {
			return this.timezones;
		},
		get: function (id) {
			return this.viewId[id];
		}
	};

	return new ViewModel();
});
