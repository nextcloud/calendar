
/**
* Configuration / App Initialization File
*/

var app = angular.module('Calendar', [
	'ngRoute',
	'ui.bootstrap',
	'ui.calendar'
]);

app.config(['$provide', '$routeProvider', '$httpProvider',
	function ($provide, $routeProvider, $httpProvider) {
		'use strict';

		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

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

		angular.forEach($.fullCalendar.langs, function(obj, lang) {
			$.fullCalendar.lang(lang, {
				timeFormat: obj.mediumTimeFormat
			});

			var propsToCheck = ['extraSmallTimeFormat', 'hourFormat', 'mediumTimeFormat', 'noMeridiemTimeFormat', 'smallTimeFormat'];

			angular.forEach(propsToCheck, function(propToCheck) {
				if (obj[propToCheck]) {
					var overwrite = {};
					overwrite[propToCheck] = obj[propToCheck].replace('HH', 'H');

					$.fullCalendar.lang(lang, overwrite);
				}
			});
		});
	}
]);

app.run(['$document', '$rootScope', '$window',
	function ($document, $rootScope, $window) {
		'use strict';

		$rootScope.baseUrl = $window.location.origin +
			$window.location.pathname +
			($window.location.pathname.substr(-1) === '/' ? '' : '/') +
			'v1/';

		$document.click(function (event) {
			$rootScope.$broadcast('documentClicked', event);
		});
	}
]);

app.controller('AttendeeController', ["$scope", "AutoCompletionService", function($scope, AutoCompletionService) {
	'use strict';

	$scope.newAttendeeGroup = -1;

	$scope.cutstats = [
		{displayname: t('calendar', 'Individual'), val: 'INDIVIDUAL'},
		{displayname: t('calendar', 'Group'), val: 'GROUP'},
		{displayname: t('calendar', 'Resource'), val: 'RESOURCE'},
		{displayname: t('calendar', 'Room'), val: 'ROOM'},
		{displayname: t('calendar', 'Unknown'), val: 'UNKNOWN'}
	];

	$scope.partstats = [
		{displayname: t('calendar', 'Required'), val: 'REQ-PARTICIPANT'},
		{displayname: t('calendar', 'Optional'), val: 'OPT-PARTICIPANT'},
		{displayname: t('calendar', 'Does not attend'), val: 'NON-PARTICIPANT'}
	];

	$scope.$parent.registerPostHook(function() {
		$scope.properties.attendee = $scope.properties.attendee || [];
		if ($scope.properties.attendee.length > 0 && $scope.properties.organizer === null) {
			$scope.properties.organizer = {
				value: 'MAILTO:' + $scope.$parent.emailAddress,
				parameters: {
					cn: OC.getCurrentUser().displayName
				}
			};
		}
	});

	$scope.add = function (email) {
		if (email !== '') {
			$scope.properties.attendee = $scope.properties.attendee || [];
			$scope.properties.attendee.push({
				value: 'MAILTO:' + email,
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
		$scope.nameofattendee = '';
	};

	$scope.remove = function (attendee) {
		$scope.properties.attendee = $scope.properties.attendee.filter(function(elem) {
			return elem.group !== attendee.group;
		});
	};

	$scope.search = function (value) {
		return AutoCompletionService.searchAttendee(value);
	};

	$scope.selectFromTypeahead = function (item) {
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
		$scope.nameofattendee = '';
	};
}]);
/**
* Controller: CalController
* Description: The fullcalendar controller.
*/

app.controller('CalController', ['$scope', '$rootScope', '$window', 'Calendar', 'CalendarService', 'VEventService', 'SettingsService', 'TimezoneService', 'VEvent', 'is', 'uiCalendarConfig', 'EventsEditorDialogService',
	function ($scope, $rootScope, $window, Calendar, CalendarService, VEventService, SettingsService, TimezoneService, VEvent, is, uiCalendarConfig, EventsEditorDialogService) {
		'use strict';

		is.loading = true;

		$scope.calendars = [];
		$scope.eventSources = [];
		$scope.eventSource = {};
		$scope.defaulttimezone = TimezoneService.current();
		$scope.eventModal = null;
		var switcher = [];

		function showCalendar(url) {
			if (switcher.indexOf(url) === -1 && $scope.eventSource[url].isRendering === false) {
				switcher.push(url);
				uiCalendarConfig.calendars.calendar.fullCalendar(
					'removeEventSource',
					$scope.eventSource[url]);
				uiCalendarConfig.calendars.calendar.fullCalendar(
					'addEventSource',
					$scope.eventSource[url]);
			}
		}

		function hideCalendar(url) {
			uiCalendarConfig.calendars.calendar.fullCalendar(
				'removeEventSource',
				$scope.eventSource[url]);
			if (switcher.indexOf(url) !== -1) {
				switcher.splice(switcher.indexOf(url), 1);
			}
		}

		function createAndRenderEvent(calendar, data, start, end, tz) {
			VEventService.create(calendar, data).then(function(vevent) {
				if (calendar.enabled) {
					var eventsToRender = vevent.getFcEvent(start, end, tz);
					angular.forEach(eventsToRender, function (event) {
						uiCalendarConfig.calendars.calendar.fullCalendar('renderEvent', event);
					});
				}
			});
		}

		function deleteAndRemoveEvent(vevent, fcEvent) {
			VEventService.delete(vevent).then(function() {
				uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', fcEvent.id);
			});
		}

		$scope.$watchCollection('calendars', function(newCalendars, oldCalendars) {
			newCalendars.filter(function(calendar) {
				return oldCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				$scope.eventSource[calendar.url] = calendar.fcEventSource;
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

		var w = angular.element($window);
		w.bind('resize', function () {
			uiCalendarConfig.calendars.calendar
				.fullCalendar('option', 'height', w.height() - angular.element('#header').height());
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
			$scope.uiConfig.calendar.timezone = 'UTC';
		});

		CalendarService.getAll().then(function(calendars) {
			$scope.calendars = calendars;
			is.loading = false;
			// TODO - scope.apply should not be necessary here
			$scope.$apply();

			angular.forEach($scope.calendars, function (calendar) {
				$scope.eventSource[calendar.url] = calendar.fcEventSource;
				if (calendar.enabled) {
					showCalendar(calendar.url);
				}
			});
		});

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
				nowIndicator: true,
				firstDay: moment().startOf('week').format('d'),
				select: function (start, end, jsEvent, view) {
					var writableCalendars = $scope.calendars.filter(function(elem) {
						return elem.isWritable();
					});

					if (writableCalendars.length === 0) {
						OC.Notification.showTemporary(t('calendar', 'Please create a calendar first.'));
						return;
					}

					start.add(start.toDate().getTimezoneOffset(), 'minutes');
					end.add(end.toDate().getTimezoneOffset(), 'minutes');

					var vevent = VEvent.fromStartEnd(start, end, $scope.defaulttimezone);
					vevent.calendar = writableCalendars[0];

					var timestamp = Date.now();
					var fcEventClass = 'new-event-dummy-' + timestamp;

					var fcEvent = vevent.getFcEvent(view.start, view.end, $scope.defaulttimezone)[0];
					fcEvent.title = t('calendar', 'New event');
					fcEvent.className.push(fcEventClass);
					fcEvent.writable = false;
					uiCalendarConfig.calendars.calendar.fullCalendar('renderEvent', fcEvent);

					EventsEditorDialogService.open($scope, fcEvent, function() {
						return $scope._calculatePopoverPosition(angular.element('.' + fcEventClass)[0], view);
					}, function() {
						return null;
					}, function() {
						uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', function(fcEventToCheck) {
							if (Array.isArray(fcEventToCheck.className)) {
								return (fcEventToCheck.className.indexOf(fcEventClass) !== -1);
							} else {
								return false;
							}
						});
					}).then(function(result) {
						createAndRenderEvent(result.calendar, result.vevent.data, view.start, view.end, $scope.defaulttimezone);
					}).catch(function() {
						//fcEvent is removed by unlock callback
						//no need to anything
						return null;
					});
				},
				eventLimit: true,
				eventClick: function(fcEvent, jsEvent, view) {
					var vevent = fcEvent.vevent;
					var oldCalendar = vevent.calendar;
					var fc = fcEvent;

					EventsEditorDialogService.open($scope, fcEvent, function() {
						return $scope._calculatePopoverPosition(jsEvent.currentTarget, view);
					}, function() {
						fc.editable = false;
						uiCalendarConfig.calendars.calendar.fullCalendar('updateEvent', fc);
					}, function() {
						fc.editable = fcEvent.calendar.writable;
						uiCalendarConfig.calendars.calendar.fullCalendar('updateEvent', fc);
					}).then(function(result) {
						// was the event moved to another calendar?
						if (result.calendar === oldCalendar) {
							VEventService.update(vevent).then(function() {
								uiCalendarConfig.calendars.calendar.fullCalendar('removeEvents', fcEvent.id);

								if (result.calendar.enabled) {
									var eventsToRender = vevent.getFcEvent(view.start, view.end, $scope.defaulttimezone);
									angular.forEach(eventsToRender, function (event) {
										uiCalendarConfig.calendars.calendar.fullCalendar('renderEvent', event);
									});
								}
							});
						} else {
							deleteAndRemoveEvent(vevent, fcEvent);
							createAndRenderEvent(result.calendar, result.vevent.data, view.start, view.end, $scope.defaulttimezone);
						}
						console.log(result);
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
					fcEvent.drop(delta);
					VEventService.update(fcEvent.vevent).catch(function() {
						revertFunc();
					});
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
			}
		};

		// TODO - where is this triggered
		$rootScope.$on('refetchEvents', function (event, calendar) {
			uiCalendarConfig.calendars.calendar.fullCalendar('refetchEvents');
		});
	}
]);

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window', 'CalendarService', 'is', 'CalendarListItem', 'Calendar',
	function ($scope, $rootScope, $window, CalendarService, is, CalendarListItem, Calendar) {
		'use strict';

		$scope.calendarListItems = [];
		$scope.is = is;
		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

		window.scope = $scope;

		$scope.$watchCollection('calendars', function(newCalendars, oldCalendars) {
			newCalendars = newCalendars || [];
			oldCalendars = oldCalendars || [];

			newCalendars.filter(function(calendar) {
				return oldCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				const item = CalendarListItem(calendar);
				if (item) {
					$scope.calendarListItems.push(item);
					calendar.register(Calendar.hookFinishedRendering, function() {
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});
				}
			});

			oldCalendars.filter(function(calendar) {
				return newCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				$scope.calendarListItems = $scope.calendarListItems.filter(function(itemToCheck) {
					return itemToCheck.calendar !== calendar;
				});
			});

			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});

		$scope.create = function (name, color) {
			CalendarService.create(name, color).then(function(calendar) {
				$scope.calendars.push(calendar);
				$rootScope.$broadcast('createdCalendar', calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});

			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
			angular.element('#new-calendar-button').click();
		};

		$scope.download = function (item) {
			var url = item.calendar.url;
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1);
			}
			url += '?export';

			$window.open(url);
		};

		$scope.toggleSharesEditor = function (calendar) {
			calendar.toggleSharesEditor();
		};

		$scope.prepareUpdate = function (calendar) {
			calendar.prepareUpdate();
		};

		$scope.onSelectSharee = function (item, model, label, calendar) {
			// Remove content from text box
			calendar.selectedSharee = '';
			// Create a default share with the user/group, read only
			CalendarService.share(calendar, item.type, item.identifier, false, false).then(function() {
				$scope.$apply();
			});
		};

		$scope.updateExistingUserShare = function(calendar, userId, writable) {
			CalendarService.share(calendar, OC.Share.SHARE_TYPE_USER, userId, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.updateExistingGroupShare = function(calendar, groupId, writable) {
			CalendarService.share(calendar, OC.Share.SHARE_TYPE_GROUP, groupId, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromUser = function(calendar, userId) {
			CalendarService.unshare(calendar, OC.Share.SHARE_TYPE_USER, userId).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromGroup = function(calendar, groupId) {
			CalendarService.unshare(calendar, OC.Share.SHARE_TYPE_GROUP, groupId).then(function() {
				$scope.$apply();
			});
		};

		$scope.findSharee = function (val, calendar) {
			return $.get(
				OC.linkToOCS('apps/files_sharing/api/v1') + 'sharees',
				{
					format: 'json',
					search: val.trim(),
					perPage: 200,
					itemType: 'principals'
				}
			).then(function(result) {
				var users   = result.ocs.data.exact.users.concat(result.ocs.data.users);
				var groups  = result.ocs.data.exact.groups.concat(result.ocs.data.groups);

				var userShares = calendar.shares.users;
				var groupShares = calendar.shares.groups;
				var userSharesLength = userShares.length;
				var groupSharesLength = groupShares.length;
				var i, j;

				// Filter out current user
				var usersLength = users.length;
				for (i = 0 ; i < usersLength; i++) {
					if (users[i].value.shareWith === OC.currentUser) {
						users.splice(i, 1);
						break;
					}
				}

				// Now filter out all sharees that are already shared with
				for (i = 0; i < userSharesLength; i++) {
					var share = userShares[i];
					usersLength = users.length;
					for (j = 0; j < usersLength; j++) {
						if (users[j].value.shareWith === share.id) {
							users.splice(j, 1);
							break;
						}
					}
				}

				// Combine users and groups
				users = users.map(function(item){
					return {
						display: item.value.shareWith,
						type: OC.Share.SHARE_TYPE_USER,
						identifier: item.value.shareWith
					};
				});

				groups = groups.map(function(item){
					return {
						display: item.value.shareWith + ' (group)',
						type: OC.Share.SHARE_TYPE_GROUP,
						identifier: item.value.shareWith
					};
				});

				return groups.concat(users);
			});
		};

		$scope.performUpdate = function (item) {
			item.saveEditor();
			CalendarService.update(item.calendar).then(function() {
				$rootScope.$broadcast('updatedCalendar', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		/**
		 * Updates the shares of the calendar
		 */
		$scope.performUpdateShares = function (calendar) {
			CalendarService.update(calendar).then(function() {
				calendar.dropPreviousState();
				calendar.list.edit = false;
				$rootScope.$broadcast('updatedCalendar', calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.triggerEnable = function(item) {
			item.calendar.toggleEnabled();

			CalendarService.update(item.calendar).then(function() {
				$rootScope.$broadcast('updatedCalendarsVisibility', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.remove = function (item) {
			CalendarService.delete(item.calendar).then(function() {
				$scope.calendars = $scope.calendars.filter(function(elem) {
					return elem !== item.calendar;
				});
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});
		};

		$rootScope.$on('reloadCalendarList', function() {
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});
	}
]);

/**
* Controller: Date Picker Controller
* Description: Takes care for pushing dates from app navigation date picker and fullcalendar.
*/
app.controller('DatePickerController', ['$scope', 'uiCalendarConfig', 'uibDatepickerConfig',
	function ($scope, uiCalendarConfig, uibDatepickerConfig) {
		'use strict';

		$scope.datepickerOptions = {
			formatDay: 'd'
		};

		function getStepSizeFromView() {
			switch($scope.selectedView) {
				case 'agendaDay':
					return 'day';

				case 'agendaWeek':
					return 'week';

				case 'month':
					return 'month';
			}
		}

		$scope.dt = new Date();
		$scope.visibility = false;

		$scope.selectedView = angular.element('#fullcalendar').attr('data-defaultView');

		angular.extend(uibDatepickerConfig, {
			showWeeks: false,
			startingDay: parseInt(moment().startOf('week').format('d'))
		});

		$scope.today = function () {
			$scope.dt = new Date();
		};

		$scope.prev = function() {
			$scope.dt = moment($scope.dt).subtract(1, getStepSizeFromView()).toDate();
		};

		$scope.next = function() {
			$scope.dt = moment($scope.dt).add(1, getStepSizeFromView()).toDate();
		};

		$scope.toggle = function() {
			$scope.visibility = !$scope.visibility;
		};

		$scope.$watch('dt', function(newValue) {
			if (uiCalendarConfig.calendars.calendar) {
				uiCalendarConfig.calendars.calendar.fullCalendar(
					'gotoDate',
					newValue
				);
			}
		});

		$scope.$watch('selectedView', function(newValue) {
			if (uiCalendarConfig.calendars.calendar) {
				uiCalendarConfig.calendars.calendar.fullCalendar(
					'changeView',
					newValue);
			}
		});
	}
]);

/**
 * Controller: Events Dialog Controller
 * Description: Takes care of anything inside the Events Modal.
 */

app.controller('EditorController', ['$scope', 'TimezoneService', 'AutoCompletionService', '$window', '$uibModalInstance', 'vevent', 'simpleEvent', 'calendar', 'isNew', 'emailAddress',
	function($scope, TimezoneService, AutoCompletionService, $window, $uibModalInstance, vevent, simpleEvent, calendar, isNew, emailAddress) {
		'use strict';

		$scope.properties = simpleEvent;
		$scope.is_new = isNew;
		$scope.calendar = calendar;
		$scope.oldCalendar = isNew ? calendar : vevent.calendar;
		$scope.readOnly = isNew ? false : !vevent.calendar.isWritable();
		$scope.selected = 1;
		$scope.timezones = [];
		$scope.emailAddress = emailAddress;
		$scope.edittimezone = ((
			$scope.properties.dtstart.parameters.zone !== 'floating' &&
			$scope.properties.dtstart.parameters.zone !== $scope.defaulttimezone) || (
			$scope.properties.dtend.parameters.zone !== 'floating' &&
			$scope.properties.dtend.parameters.zone !== $scope.defaulttimezone
		));

		$scope.preEditingHooks = [];
		$scope.postEditingHooks = [];

		$scope.tabs = [
			{title: t('calendar', 'Attendees'), value: 1},
			{title: t('calendar', 'Reminders'), value: 2},
			{title: t('calendar', 'Repeating'), value: 3}
		];

		$scope.classSelect = [
			{displayname: t('calendar', 'When shared show full event'), type: 'PUBLIC'},
			{displayname: t('calendar', 'When shared show only busy'), type: 'CONFIDENTIAL'},
			{displayname: t('calendar', 'When shared hide this event'), type: 'PRIVATE'}
		];
		
		$scope.statusSelect = [
			{displayname: t('calendar', 'Confirmed'), type: 'CONFIRMED'},
			{displayname: t('calendar', 'Tentative'), type: 'TENTATIVE'},
			{displayname: t('calendar', 'Cancelled'), type: 'CANCELLED'}
		];

		$scope.registerPreHook = function(callback) {
			$scope.preEditingHooks.push(callback);
		};

		$uibModalInstance.rendered.then(function() {
			if ($scope.properties.dtend.type === 'date') {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.subtract(1, 'days'));
			}

			angular.forEach($scope.preEditingHooks, function(callback) {
				callback();
			});

			$scope.tabopener(1);
		});

		$scope.registerPostHook = function(callback) {
			$scope.postEditingHooks.push(callback);
		};

		$scope.proceed = function() {
			$scope.prepareClose();
			$uibModalInstance.close({
				action: 'proceed',
				calendar: $scope.calendar,
				simple: $scope.properties,
				vevent: vevent
			});
		};

		$scope.save = function() {
			if (!$scope.validate()) {
				return;
			}

			$scope.prepareClose();
			$scope.properties.patch();
			$uibModalInstance.close({
				action: 'save',
				calendar: $scope.calendar,
				simple: $scope.properties,
				vevent: vevent
			});
		};

		$scope.validate = function() {
			var error = false;
			if ($scope.properties.summary === null || $scope.properties.summary.value.trim() === '') {
				OC.Notification.showTemporary(t('calendar', 'Please add a title!'));
				error = true;
			}
			if ($scope.calendar === null || typeof $scope.calendar === 'undefined') {
				OC.Notification.showTemporary(t('calendar', 'Please select a calendar!'));
				error = true;
			}

			return !error;
		};

		$scope.prepareClose = function() {
			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';
				$scope.properties.dtend.value.add(1, 'days');
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';
			}

			angular.forEach($scope.postEditingHooks, function(callback) {
				callback();
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

		/**
		 * Everything tabs
		 */
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
		/**
		 * Everything date and time
		 */
		$scope.$watch('properties.dtstart.value', function(nv, ov) {
			var diff = nv.diff(ov, 'seconds');
			if (diff !== 0) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(diff, 'seconds'));
			}
		});

		$scope.toggledAllDay = function() {
			if ($scope.properties.allDay) {
				return;
			}

			if ($scope.properties.dtstart.value.isSame($scope.properties.dtend.value)) {
				$scope.properties.dtend.value = moment($scope.properties.dtend.value.add(1, 'hours'));
			}

			if ($scope.properties.dtstart.parameters.zone === 'floating' &&
				$scope.properties.dtend.parameters.zone === 'floating') {
				$scope.properties.dtstart.parameters.zone = $scope.defaulttimezone;
				$scope.properties.dtend.parameters.zone = $scope.defaulttimezone;
			}
		};

		/**
		 * Everything timezones
		 */
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

		/**
		 * Everything location
		 */
		$scope.searchLocation = function(value) {
			return AutoCompletionService.searchLocation(value);
		};

		$scope.selectLocationFromTypeahead = function(item) {
			$scope.properties.location.value = item.label;
		};

		/**
		 * Everything access class
		 */
		$scope.setClassToDefault = function() {
			if ($scope.properties.class === null) {
				$scope.properties.class = {
					type: 'string',
					value: 'PUBLIC'
				};
			}
		};
		
		$scope.setStatusToDefault = function() {
			if ($scope.properties.status === null) {
				$scope.properties.status = {
						type: 'string',
						value: 'CONFIRMED'
				};
			}
		};
	}
]);
/**
 * Controller: ImportController
 * Description: Takes care of importing calendars
 */

app.controller('ImportController', ['$scope', '$filter', 'CalendarService', 'VEventService', '$uibModalInstance', 'files', 'ImportFileWrapper',
	function($scope, $filter, CalendarService, VEventService, $uibModalInstance, files, ImportFileWrapper) {
		'use strict';

		$scope.rawFiles = files;
		$scope.files = [];

		$scope.showCloseButton = false;
		$scope.writableCalendars = $scope.calendars.filter(function(elem) {
			return elem.isWritable();
		});

		$scope.import = function (fileWrapper) {
			fileWrapper.state = ImportFileWrapper.stateScheduled;

			var importCalendar = function(calendar) {
				const objects = fileWrapper.splittedICal.objects;

				angular.forEach(objects, function(object) {
					VEventService.create(calendar, object, false).then(function(response) {
						fileWrapper.state = ImportFileWrapper.stateImporting;
						fileWrapper.progress++;

						if (!response) {
							fileWrapper.errors++;
						}
					});
				});
			};

			if (fileWrapper.selectedCalendar === 'new') {
				var name = fileWrapper.splittedICal.name || fileWrapper.file.name;
				var color = fileWrapper.splittedICal.color || randColour(); // jshint ignore:line

				var components = [];
				if (fileWrapper.splittedICal.vevents.length > 0) {
					components.push('vevent');
					components.push('vtodo');
				}
				if (fileWrapper.splittedICal.vjournals.length > 0) {
					components.push('vjournal');
				}
				if (fileWrapper.splittedICal.vtodos.length > 0 && components.indexOf('vtodo') === -1) {
					components.push('vtodo');
				}

				CalendarService.create(name, color, components).then(function(calendar) {
					if (calendar.components.vevent) {
						$scope.calendars.push(calendar);
						$scope.writableCalendars.push(calendar);
					}
					importCalendar(calendar);
				});
			} else {
				var calendar = $scope.calendars.filter(function (element) {
					return element.url === fileWrapper.selectedCalendar;
				})[0];
				importCalendar(calendar);
			}


		};

		$scope.preselectCalendar = function(fileWrapper) {
			var possibleCalendars = $filter('importCalendarFilter')($scope.writableCalendars, fileWrapper);
			if (possibleCalendars.length === 0) {
				fileWrapper.selectedCalendar = 'new';
			} else {
				fileWrapper.selectedCalendar = possibleCalendars[0].url;
			}
		};

		$scope.changeCalendar = function(fileWrapper) {
			if (fileWrapper.selectedCalendar === 'new') {
				fileWrapper.incompatibleObjectsWarning = false;
			} else {
				var possibleCalendars = $filter('importCalendarFilter')($scope.writableCalendars, fileWrapper);
				fileWrapper.incompatibleObjectsWarning = (possibleCalendars.indexOf(fileWrapper.selectedCalendar) === -1);
			}
		};

		angular.forEach($scope.rawFiles, function(rawFile) {
			var fileWrapper = ImportFileWrapper(rawFile);
			fileWrapper.read(function() {
				$scope.preselectCalendar(fileWrapper);
				$scope.$apply();
			});

			fileWrapper.register(ImportFileWrapper.hookProgressChanged, function() {
				$scope.$apply();
			});

			fileWrapper.register(ImportFileWrapper.hookDone, function() {
				$scope.$apply();
				$scope.closeIfNecessary();

				//TODO - refetch calendar
			});

			fileWrapper.register(ImportFileWrapper.hookErrorsChanged, function() {
				$scope.$apply();
			});

			$scope.files.push(fileWrapper);
		});


		$scope.closeIfNecessary = function() {
			var unfinishedFiles = $scope.files.filter(function(fileWrapper) {
				return !fileWrapper.wasCanceled() && !fileWrapper.isDone();
			});
			var filesEncounteredErrors = $scope.files.filter(function(fileWrapper) {
				return fileWrapper.isDone() && fileWrapper.hasErrors();
			});

			if (unfinishedFiles.length === 0 && filesEncounteredErrors.length === 0) {
				$uibModalInstance.close();
			} else if (unfinishedFiles.length === 0 && filesEncounteredErrors.length !== 0) {
				$scope.showCloseButton = true;
				$scope.$apply();
			}
		};

		$scope.close = function() {
			$uibModalInstance.close();
		};

		$scope.cancelFile = function(fileWrapper) {
			fileWrapper.state = ImportFileWrapper.stateCanceled;
			$scope.closeIfNecessary();
		};
	}
]);

app.controller('RecurrenceController', ["$scope", function($scope) {
	'use strict';

	$scope.rruleNotSupported = false;

	$scope.repeat_options_simple = [
		{val: 'NONE', displayname: t('calendar', 'None')},
		{val: 'DAILY', displayname: t('calendar', 'Every day')},
		{val: 'WEEKLY', displayname: t('calendar', 'Every week')},
		{val: 'MONTHLY', displayname: t('calendar', 'Every month')},
		{val: 'YEARLY', displayname: t('calendar', 'Every year')}//,
		//{val: 'CUSTOM', displayname: t('calendar', 'Custom')}
	];

	$scope.selected_repeat_end = 'NEVER';
	$scope.repeat_end = [
		{val: 'NEVER', displayname: t('calendar', 'never')},
		{val: 'COUNT', displayname: t('calendar', 'after')}//,
		//{val: 'UNTIL', displayname: t('calendar', 'on date')}
	];

	$scope.$parent.registerPreHook(function() {
		if ($scope.properties.rrule.freq !== 'NONE') {
			var unsupportedFREQs = ['SECONDLY', 'MINUTELY', 'HOURLY'];
			if (unsupportedFREQs.indexOf($scope.properties.rrule.freq) !== -1) {
				$scope.rruleNotSupported = true;
			}

			if (typeof $scope.properties.rrule.parameters !== 'undefined') {
				var partIds = Object.getOwnPropertyNames($scope.properties.rrule.parameters);
				if (partIds.length > 0) {
					$scope.rruleNotSupported = true;
				}
			}

			if ($scope.properties.rrule.count !== null) {
				$scope.selected_repeat_end = 'COUNT';
			} else if ($scope.properties.rrule.until !== null) {
				$scope.rruleNotSupported = true;
				//$scope.selected_repeat_end = 'UNTIL';
			}

			/*if (!moment.isMoment($scope.properties.rrule.until)) {
			 $scope.properties.rrule.until = moment();
			 }*/

			if ($scope.properties.rrule.interval === null) {
				$scope.properties.rrule.interval = 1;
			}
		}
	});

	$scope.$parent.registerPostHook(function() {
		$scope.properties.rrule.dontTouch = $scope.rruleNotSupported;

		if ($scope.selected_repeat_end === 'NEVER') {
			$scope.properties.rrule.count = null;
			$scope.properties.rrule.until = null;
		}
	});

	$scope.resetRRule = function() {
		$scope.selected_repeat_end = 'NEVER';
		$scope.properties.rrule.freq = 'NONE';
		$scope.properties.rrule.count = null;
		//$scope.properties.rrule.until = null;
		$scope.properties.rrule.interval = 1;
		$scope.rruleNotSupported = false;
		$scope.properties.rrule.parameters = {};
	};


}]);
/**
 * Controller: SettingController
 * Description: Takes care of the Calendar Settings.
 */

app.controller('SettingsController', ['$scope', '$uibModal',
	function ($scope, $uibModal) {
		'use strict';

		$scope.settingsCalDavLink = OC.linkToRemote('dav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('dav') + '/principals/users/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';

		angular.element('#import').on('change', function () {
			var filesArray = [];
			for (var i=0; i < this.files.length; i++) {
				filesArray.push(this.files[i]);
			}

			if (filesArray.length > 0) {
				$uibModal.open({
					templateUrl: 'import.html',
					controller: 'ImportController',
					windowClass: 'import',
					backdropClass: 'import-backdrop',
					keyboard: false,
					appendTo: angular.element('#importpopover-container'),
					resolve: {
						files: function () {
							return filesArray;
						}
					},
					scope: $scope
				});
			}

			angular.element('#import').val(null);
		});
	}
]);

/**
* Controller: SubscriptionController
* Description: Takes care of Subscription List in the App Navigation.
*/
app.controller('SubscriptionController', ['$scope', function($scope) {}]);
/*
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
*/
app.controller('VAlarmController', ["$scope", function($scope) {
	'use strict';

	$scope.newReminderId = -1;

	$scope.alarmFactors = [
		60, //seconds
		60, //minutes
		24, //hours
		7 //days
	];

	$scope.reminderSelect = [
		{ displayname: t('calendar', 'At time of event'), trigger: 0},
		{ displayname: t('calendar', '5 minutes before'), trigger: -1 * 5 * 60},
		{ displayname: t('calendar', '10 minutes before'), trigger: -1 * 10 * 60},
		{ displayname: t('calendar', '15 minutes before'), trigger: -1 * 15 * 60},
		{ displayname: t('calendar', '30 minutes before'), trigger: -1 * 30 * 60},
		{ displayname: t('calendar', '1 hour before'), trigger: -1 * 60 * 60},
		{ displayname: t('calendar', '2 hours before'), trigger: -1 * 2 * 60 * 60},
		{ displayname: t('calendar', 'Custom'), trigger: 'custom'}
	];

	$scope.reminderSelectTriggers = $scope.reminderSelect.map(function(elem) {
		return elem.trigger;
	}).filter(function(elem) {
		return (typeof elem === 'number');
	});

	$scope.reminderTypeSelect = [
		{ displayname: t('calendar', 'Audio'), type: 'AUDIO'},
		{ displayname: t('calendar', 'E Mail'), type: 'EMAIL'},
		{ displayname: t('calendar', 'Pop up'), type: 'DISPLAY'}
	];

	$scope.timeUnitReminderSelect = [
		{ displayname: t('calendar', 'sec'), factor: 1},
		{ displayname: t('calendar', 'min'), factor: 60},
		{ displayname: t('calendar', 'hours'), factor: 60 * 60},
		{ displayname: t('calendar', 'days'), factor: 60 * 60 * 24},
		{ displayname: t('calendar', 'week'), factor: 60 * 60 * 24 * 7}
	];

	$scope.timePositionReminderSelect = [
		{ displayname: t('calendar', 'before'), factor: -1},
		{ displayname: t('calendar', 'after'), factor: 1}
	];

	$scope.startEndReminderSelect = [
		{ displayname: t('calendar', 'start'), type: 'start'},
		{ displayname: t('calendar', 'end'), type: 'end'}
	];

	$scope.$parent.registerPreHook(function() {
		angular.forEach($scope.properties.alarm, function(alarm) {
			$scope._addEditorProps(alarm);
		});
	});

	$scope.$parent.registerPostHook(function() {
		angular.forEach($scope.properties.alarm, function(alarm) {
			if (alarm.editor.triggerType === 'absolute') {
				alarm.trigger.value = alarm.editor.absMoment;
			}
		});
	});

	$scope._addEditorProps = function(alarm) {
		angular.extend(alarm, {
			editor: {
				triggerValue: 0,
				triggerBeforeAfter: -1,
				triggerTimeUnit: 1,
				absMoment: moment(),
				editing: false
			}
		});

		alarm.editor.reminderSelectValue =
			($scope.reminderSelectTriggers.indexOf(alarm.trigger.value) !== -1) ?
				alarm.editor.reminderSelectValue = alarm.trigger.value :
				alarm.editor.reminderSelectValue = 'custom';

		alarm.editor.triggerType =
			(alarm.trigger.type === 'duration') ?
				'relative' :
				'absolute';

		if (alarm.editor.triggerType === 'relative') {
			$scope._prepareRelativeVAlarm(alarm);
		} else {
			$scope._prepareAbsoluteVAlarm(alarm);
		}

		$scope._prepareRepeat(alarm);
	};

	$scope._prepareRelativeVAlarm = function(alarm) {
		var unitAndValue = $scope._getUnitAndValue(Math.abs(alarm.trigger.value));

		angular.extend(alarm.editor, {
			triggerBeforeAfter: (alarm.trigger.value < 0) ? -1 : 1,
			triggerTimeUnit: unitAndValue[0],
			triggerValue: unitAndValue[1]
		});
	};

	$scope._prepareAbsoluteVAlarm = function(alarm) {
		alarm.editor.absMoment = alarm.trigger.value;
	};

	$scope._prepareRepeat = function(alarm) {
		var unitAndValue = $scope._getUnitAndValue((alarm.duration && alarm.duration.value) ? alarm.duration.value : 0);

		angular.extend(alarm.editor, {
			repeat: !(!alarm.repeat.value || alarm.repeat.value === 0),
			repeatNTimes: (alarm.editor.repeat) ? alarm.repeat.value : 0,
			repeatTimeUnit: unitAndValue[0],
			repeatNValue: unitAndValue[1]
		});
	};

	$scope._getUnitAndValue = function(value) {
		var unit = 1;

		var alarmFactors = [
			60,
			60,
			24,
			7
		];

		for (var i = 0; i < alarmFactors.length && value !== 0; i++) {
			var mod = value % alarmFactors[i];
			if (mod !== 0) {
				break;
			}

			unit *= alarmFactors[i];
			value /= alarmFactors[i];
		}

		return [unit, value];
	};

	$scope.add = function() {
		var setTriggers = [];
		angular.forEach($scope.properties.alarm, function(alarm) {
			if (alarm.trigger && alarm.trigger.type === 'duration') {
				setTriggers.push(alarm.trigger.value);
			}
		});

		var triggersToSuggest = [];
		angular.forEach($scope.reminderSelect, function(option) {
			if (typeof option.trigger !== 'number' || option.trigger > -1 * 15 * 60) {
				return;
			}

			triggersToSuggest.push(option.trigger);
		});

		var triggerToSet = null;
		for (var i=0; i < triggersToSuggest.length; i++) {
			if (setTriggers.indexOf(triggersToSuggest[i]) === -1) {
				triggerToSet = triggersToSuggest[i];
				break;
			}
		}
		if (triggerToSet === null) {
			triggerToSet = triggersToSuggest[triggersToSuggest.length - 1];
		}

		var alarm = {
			id: $scope.newReminderId--,
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			trigger: {
				type: 'duration',
				value: triggerToSet,
				related: 'start'
			},
			repeat: {},
			duration: {}
		};

		$scope._addEditorProps(alarm);
		$scope.properties.alarm.push(alarm);
	};

	$scope.remove = function (alarm) {
		$scope.properties.alarm = $scope.properties.alarm.filter(function(elem) {
			return elem !== alarm;
		});
	};

	$scope.triggerEdit = function(alarm) {
		if (alarm.editor.editing === true) {
			alarm.editor.editing = false;
		} else {
			if ($scope.isEditingReminderSupported(alarm)) {
				alarm.editor.editing = true;
			} else {
				OC.Notification.showTemporary(t('calendar', 'Editing reminders of unknown type not supported.'));
			}
		}
	};

	$scope.isEditingReminderSupported = function(alarm) {
		//WE DON'T AIM TO SUPPORT PROCEDURE
		return (['AUDIO', 'DISPLAY', 'EMAIL'].indexOf(alarm.action.value) !== -1);
	};

	$scope.updateReminderSelectValue = function(alarm) {
		var factor = alarm.editor.reminderSelectValue;
		if (factor !== 'custom') {
			alarm.duration = {};
			alarm.repeat = {};
			alarm.trigger.related = 'start';
			alarm.trigger.type = 'duration';
			alarm.trigger.value = parseInt(factor);

			$scope._addEditorProps(alarm);
		}
	};

	$scope.updateReminderRelative = function(alarm) {
		alarm.trigger.value =
			parseInt(alarm.editor.triggerBeforeAfter) *
			parseInt(alarm.editor.triggerTimeUnit) *
			parseInt(alarm.editor.triggerValue);

		alarm.trigger.type = 'duration';
	};

	$scope.updateReminderAbsolute = function(alarm) {
		if (!moment.isMoment(alarm.trigger.value)) {
			alarm.trigger.value = moment();
		}

		alarm.trigger.type = 'date-time';
	};

	$scope.updateReminderRepeat = function(alarm) {
		alarm.repeat.type = 'string';
		alarm.repeat.value = alarm.editor.repeatNTimes;
		alarm.duration.type = 'duration';
		alarm.duration.value =
			parseInt(alarm.editor.repeatNValue) *
			parseInt(alarm.editor.repeatTimeUnit);
	};
}]);

/* https://github.com/kayellpeee/hsl_rgb_converter
 * expected hue range: [0, 360)
 * expected saturation range: [0, 1]
 * expected lightness range: [0, 1]
 */
var hslToRgb = function(hue, saturation, lightness) {
	'use strict';
	// based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
	if(Array.isArray(hue)) {
		saturation = hue[1];
		lightness = hue[2];
		hue = hue[0];
	}
	if (hue === undefined) {
		return [0, 0, 0];
	}
	saturation /= 100;
	lightness /= 100;

	var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
	var huePrime = hue / 60;
	var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

	huePrime = Math.floor(huePrime);
	var red;
	var green;
	var blue;

	if (huePrime === 0) {
		red = chroma;
		green = secondComponent;
		blue = 0;
	} else if (huePrime === 1) {
		red = secondComponent;
		green = chroma;
		blue = 0;
	} else if (huePrime === 2) {
		red = 0;
		green = chroma;
		blue = secondComponent;
	} else if (huePrime === 3) {
		red = 0;
		green = secondComponent;
		blue = chroma;
	} else if (huePrime === 4) {
		red = secondComponent;
		green = 0;
		blue = chroma;
	} else if (huePrime === 5) {
		red = chroma;
		green = 0;
		blue = secondComponent;
	}

	var lightnessAdjustment = lightness - (chroma / 2);
	red += lightnessAdjustment;
	green += lightnessAdjustment;
	blue += lightnessAdjustment;

	return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];

};

/*
 * Convert rgb array to hex string
 */
var rgbToHex = function(r, g, b) {
	'use strict';
	if(Array.isArray(r)) {
		g = r[1];
		b = r[2];
		r = r[0];
	}
	return '#' + parseInt(r, 10).toString(16) + parseInt(g, 10).toString(16) + parseInt(b, 10).toString(16);
};

var listofcolours = [
	'#31CC7C',
	'#317CCC',
	'#FF7A66',
	'#F1DB50',
	'#7C31CC',
	'#CC317C',
	'#3A3B3D',
	'#CACBCD'
];

/*
 * Generate a random colour with the core generator
 */
var randColour = function() {
	'use strict';
	if (typeof String.prototype.toHsl === 'function') {
		return rgbToHex(hslToRgb(Math.random().toString().toHsl()));
	} else {
		return listofcolours[Math.floor(Math.random() * listofcolours.length)];
	}
};

/**
 * Directive: Colorpicker
 * Description: Colorpicker for the Calendar app.
 */


app.directive('colorpicker', function() {
	'use strict';
	if (typeof String.prototype.toHsl === 'function') {
		var hsl = "";
		var hslcolour = "";
		//		  0    40   80   120  160  200   240  280  320
		listofcolours = ["15", "9", "4", "b", "6", "11", "74", "f", "57"];
		listofcolours.forEach(function(hash, index) {
			hsl = hash.toHsl();
			hslcolour = hslToRgb(hsl);
			listofcolours[index] = rgbToHex(hslcolour);
		});
	}
	return {
		scope: {
			selected: '=',
			customizedColors: '=colors'
		},
		restrict: 'AE',
		templateUrl: OC.filePath('calendar', 'templates', 'colorpicker.html'),
		link: function(scope, element, attr) {
			scope.colors = scope.customizedColors || listofcolours;
			scope.selected = scope.selected || scope.colors[0];
			scope.random = "#000000";

			scope.randomizeColour = function() {
				scope.random = randColour();
				scope.pick(scope.random);
			};

			scope.pick = function(color) {
				scope.selected = color;
			};

		}
	};

});

app.directive('ocdatetimepicker', ["$compile", "$timeout", function($compile, $timeout) {
	'use strict';

	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			disabletime: '=disabletime'
		},
		link: function (scope, element, attrs, ngModelCtrl) {
			var templateHTML = '<input type="text" ng-model="date" class="events--date" />';
			templateHTML += '<input type="text" ng-model="time" class="events--time" ng-disabled="disabletime"/>';
			var template = angular.element(templateHTML);

			scope.date = null;
			scope.time = null;

			$compile(template)(scope);
			element.append(template);

			function updateFromUserInput() {
				var date = element.find('.events--date').datepicker('getDate'),
					hours = 0,
					minutes = 0;

				if (!scope.disabletime) {
					hours = element.find('.events--time').timepicker('getHour');
					minutes = element.find('.events--time').timepicker('getMinute');
				}

				var m = moment(date);
				m.hours(hours);
				m.minutes(minutes);
				m.seconds(0);

				//Hiding the timepicker is an ugly hack to mitigate a bug in the timepicker
				//We might want to consider using another timepicker in the future
				element.find('.events--time').timepicker('hide');
				ngModelCtrl.$setViewValue(m);
			}

			var localeData = moment.localeData();
			function initDatePicker() {
				element.find('.events--date').datepicker({
					dateFormat: localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
					monthNames: moment.months(),
					monthNamesShort: moment.monthsShort(),
					dayNames: moment.weekdays(),
					dayNamesMin: moment.weekdaysMin(),
					dayNamesShort: moment.weekdaysShort(),
					firstDay: localeData.firstDayOfWeek(),
					minDate: null,
					showOtherMonths: true,
					selectOtherMonths: true,
					onClose: updateFromUserInput
				});
			}
			function initTimepicker() {
				element.find('.events--time').timepicker({
					showPeriodLabels: false,
					showLeadingZero: true,
					showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1),
					duration: 0,
					onClose: updateFromUserInput
				});
			}

			initDatePicker();
			initTimepicker();

			scope.$watch(function() {
				return ngModelCtrl.$modelValue;
			}, function(value) {
				if (moment.isMoment(value)) {
					element.find('.events--date').datepicker('setDate', value.toDate());
					element.find('.events--time').timepicker('setTime', value.toDate());
				}
			});
			element.on('$destroy', function() {
				element.find('.events--date').datepicker('destroy');
				element.find('.events--time').timepicker('destroy');
			});
		}
	};
}]);
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

app.directive('onToggleShow', function () {
	'use strict';
	return {
		restrict: 'A',
		scope: {
			'onToggleShow': '@'
		},
		link: function (scope, elem) {
			elem.click(function () {
				var target = $(scope.onToggleShow);
				target.toggle();
			});

			scope.$on('documentClicked', function (s, event) {
				var target = $(scope.onToggleShow);

				if (event.target !== elem[0]) {
					target.hide();
				}
			});
		}
	};
});

app.filter('attendeeFilter', function() {
	'use strict';

	return function(attendee) {
		if (typeof attendee !== 'object' || !attendee) {
			return '';
		} else if (typeof attendee.parameters === 'object' && typeof attendee.parameters.cn === 'string') {
			return attendee.parameters.cn;
		} else if (typeof attendee.value === 'string' && attendee.value.startsWith('MAILTO:')) {
			return attendee.value.substr(7);
		} else {
			return attendee.value || '';
		}
	};
});

app.filter('attendeeNotOrganizerFilter', function () {
	'use strict';

	return function (attendees, organizer) {
		if (typeof organizer !== 'string' || organizer === '') {
			return Array.isArray(attendees) ? attendees : [];
		}

		if (!Array.isArray(attendees)) {
			return [];
		}

		var organizerValue = 'MAILTO:' + organizer;
		return attendees.filter(function(element) {
			if (typeof element !== 'object') {
				return false;
			} else {
				return element.value !== organizerValue;
			}
		});
	};
});

app.filter('calendarFilter', function() {
	'use strict';

	return function (calendars) {
		if (!Array.isArray(calendars)) {
			return [];
		}

		return calendars.filter(function(element) {
			if (typeof element !== 'object') {
				return false;
			} else {
				return element.isWritable();
			}
		});
	};
});

app.filter('calendarListFilter', ["CalendarListItem", function(CalendarListItem) {
	'use strict';

	return function (calendarListItems) {
		if (!Array.isArray(calendarListItems)) {
			return [];
		}

		return calendarListItems.filter(function(item) {
			if (!CalendarListItem.isCalendarListItem(item)) {
				return false;
			}
			return item.calendar.isWritable();
		});
	};
}]);

app.filter('calendarSelectorFilter', function () {
	'use strict';

	return function (calendars, calendar) {
		if (!Array.isArray(calendars)) {
			return [];
		}

		var options = calendars.filter(function (c) {
			return c.isWritable();
		});

		if (typeof calendar !== 'object' || !calendar) {
			return options;
		}

		if (!calendar.isWritable()) {
			return [calendar];
		} else {
			if (options.indexOf(calendar) === -1) {
				options.push(calendar);
			}

			return options;
		}
	};
});

app.filter('datepickerFilter', function () {
	'use strict';

	return function (datetime, view) {
		if (!(datetime instanceof Date) || typeof view !== 'string') {
			return '';
		}

		switch(view) {
			case 'agendaDay':
				return moment(datetime).format('ll');

			case 'agendaWeek':
				return t('calendar', 'Week {number} of {year}',
					{number:moment(datetime).week(),
						year: moment(datetime).week() === 1 ?
							moment(datetime).add(1, 'week').year() :
							moment(datetime).year()});

			case 'month':
				return moment(datetime).week() === 1 ?
					moment(datetime).add(1, 'week').format('MMMM GGGG') :
					moment(datetime).format('MMMM GGGG');

			default:
				return '';
		}
	};
});

app.filter('importCalendarFilter', function () {
	'use strict';

	return function (calendars, file) {
		if (!Array.isArray(calendars) || typeof file !== 'object' || !file || typeof file.splittedICal !== 'object' || !file.splittedICal) {
			return [];
		}

		var events = file.splittedICal.vevents.length,
			journals = file.splittedICal.vjournals.length,
			todos = file.splittedICal.vtodos.length;

		return calendars.filter(function(calendar) {
			if (events !== 0 && !calendar.components.vevent) {
				return false;
			}
			if (journals !== 0 && !calendar.components.vjournal) {
				return false;
			}
			if (todos !== 0 && !calendar.components.vtodo) {
				return false;
			}

			return true;
		});
	};
});

app.filter('importErrorFilter', function () {
	'use strict';

	return function (file) {
		if (typeof file !== 'object' || !file || typeof file.errors !== 'number') {
			return '';
		}

		//TODO - use n instead of t to use proper plurals in all translations
		switch(file.errors) {
			case 0:
				return t('calendar', 'Successfully imported');

			case 1:
				return t('calendar', 'Partially imported, 1 failure');

			default:
				return t('calendar', 'Partially imported, {n} failures', {
					n: file.errors
				});
		}
	};
});

app.filter('simpleReminderDescription', function() {
	'use strict';
	
	var actionMapper = {
		AUDIO: t('calendar', 'Audio alarm'),
		DISPLAY: t('calendar', 'Pop-up'),
		EMAIL: t('calendar', 'E-Mail'),
		NONE: t('calendar', 'None')
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
		if (typeof alarm !== 'object' || !alarm || typeof alarm.trigger !== 'object' || !alarm.trigger) {
			return '';
		}

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
			if (alarm.editor && moment.isMoment(alarm.editor.absMoment)) {
				return t('calendar', '{type} at {time}', {
					type: getActionName(alarm),
					time: alarm.editor.absMoment.format('LLLL')
				});
			} else {
				return '';
			}
		}
	};
});

app.filter('subscriptionFilter', function () {
	'use strict';

	return function (calendars) {
		if (!Array.isArray(calendars)) {
			return [];
		}

		return calendars.filter(function(element) {
			if (typeof element !== 'object') {
				return false;
			} else {
				return !element.isWritable();
			}
		});
	};
});

app.filter('subscriptionListFilter', ["CalendarListItem", function(CalendarListItem) {
	'use strict';

	return function (calendarListItems) {
		if (!Array.isArray(calendarListItems)) {
			return [];
		}

		return calendarListItems.filter(function(item) {
			if (!CalendarListItem.isCalendarListItem(item)) {
				return false;
			}
			return !item.calendar.isWritable();
		});
	};
}]);

app.filter('timezoneFilter', ['$filter', function($filter) {
	'use strict';

	return function(timezone) {
		if (typeof timezone !== 'string') {
			return '';
		}

		timezone = timezone.split('_').join(' ');

		var elements = timezone.split('/');
		if (elements.length === 1) {
			return elements[0];
		} else {
			var continent = elements[0];
			var city = $filter('timezoneWithoutContinentFilter')(elements.slice(1).join('/'));

			return city + ' (' + continent + ')';
		}
	};
}]);

app.filter('timezoneWithoutContinentFilter', function() {
	'use strict';

	return function(timezone) {
		timezone = timezone.split('_').join(' ');
		timezone = timezone.replace('St ', 'St. ');

		return timezone.split('/').join(' - ');
	};
});

app.factory('CalendarListItem', ["Calendar", function(Calendar) {
	'use strict';

	function CalendarListItem(calendar) {
		const context = {
			calendar: calendar,
			isEditingShares: false,
			isEditingProperties: false,
			isDisplayingCalDAVUrl: false
		};
		const iface = {
			_isACalendarListItemObject: true
		};

		if (!Calendar.isCalendar(calendar)) {
			return null;
		}

		Object.defineProperties(iface, {
			calendar: {
				get: function() {
					return context.calendar;
				}
			}
		});
		
		iface.displayCalDAVUrl = function() {
			return context.isDisplayingCalDAVUrl;
		};

		iface.showCalDAVUrl = function() {
			context.isDisplayingCalDAVUrl = true;
		};

		iface.hideCalDAVUrl = function() {
			context.isDisplayingCalDAVUrl = false;
		};

		iface.isEditingShares = function() {
			return context.isEditingShares;
		};

		iface.toggleEditingShares = function() {
			context.isEditingShares = !context.isEditingShares;
		};

		iface.isEditing = function() {
			return context.isEditingProperties;
		};

		iface.displayActions = function() {
			return !iface.isEditing();
		};

		iface.displayColorIndicator = function() {
			return (!iface.isEditing() && !context.calendar.isRendering());
		};

		iface.displaySpinner = function() {
			return (!iface.isEditing() && context.calendar.isRendering());
		};

		iface.openEditor = function() {
			iface.color = context.calendar.color;
			iface.displayname = context.calendar.displayname;

			context.isEditingProperties = true;
		};

		iface.cancelEditor = function() {
			iface.color = '';
			iface.displayname = '';

			context.isEditingProperties = false;
		};

		iface.saveEditor = function() {
			context.calendar.color = iface.color;
			context.calendar.displayname = iface.displayname;

			iface.color = '';
			iface.displayname = '';

			context.isEditingProperties = false;
		};

		//Properties for ng-model of calendar editor
		iface.color = '';
		iface.displayname = '';

		iface.order = 0;

		iface.selectedSharee = '';

		return iface;
	}

	CalendarListItem.isCalendarListItem = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isACalendarListItemObject === true);
	};

	return CalendarListItem;
}]);

app.factory('Calendar', ["$window", "Hook", "VEventService", "TimezoneService", "ColorUtilityService", "RandomStringService", function($window, Hook, VEventService, TimezoneService, ColorUtilityService, RandomStringService) {
	'use strict';

	function Calendar(url, props) {
		url = url || '';
		props = props || {};

		const context = {
			fcEventSource: {},
			components: props.components,
			mutableProperties: {
				color: props.color,
				displayname: props.displayname,
				enabled: props.enabled,
				order: props.order
			},
			updatedProperties: [],
			tmpId: RandomStringService.generate(),
			url: url,
			owner: props.owner,
			shares: props.shares,
			warnings: [],
			shareable: props.shareable,
			writable: props.writable,
			writableProperties: props.writableProperties
		};
		const iface = {
			_isACalendarObject: true
		};

		context.fcEventSource.events = function (start, end, timezone, callback) {
			TimezoneService.get(timezone).then(function (tz) {
				context.fcEventSource.isRendering = true;
				iface.emit(Calendar.hookFinishedRendering);

				VEventService.getAll(iface, start, end).then(function (events) {
					var vevents = [];
					for (var i = 0; i < events.length; i++) {
						var vevent;
						try {
							vevent = events[i].getFcEvent(start, end, tz);
						} catch (err) {
							iface.addWarning(err.toString());
							console.log(err);
							console.log(events[i]);
							continue;
						}
						vevents = vevents.concat(vevent);
					}

					callback(vevents);
					context.fcEventSource.isRendering = false;

					iface.emit(Calendar.hookFinishedRendering);
				});
			});
		};
		context.fcEventSource.editable = context.writable;
		context.fcEventSource.calendar = iface;
		context.fcEventSource.isRendering = false;

		context.setUpdated = function(property) {
			if (context.updatedProperties.indexOf(property) === -1) {
				context.updatedProperties.push(property);
			}
		};

		Object.defineProperties(iface, {
			color: {
				get: function() {
					return context.mutableProperties.color;
				},
				set: function(color) {
					var oldColor = context.mutableProperties.color;
					if (color === oldColor) {
						return;
					}
					context.mutableProperties.color = color;
					context.setUpdated('color');
					iface.emit(Calendar.hookColorChanged, color, oldColor);
				}
			},
			textColor: {
				get: function() {
					const colors = ColorUtilityService.extractRGBFromHexString(context.mutableProperties.color);
					return ColorUtilityService.generateTextColorFromRGB(colors.r, colors.g, colors.b);
				}
			},
			displayname: {
				get: function() {
					return context.mutableProperties.displayname;
				},
				set: function(displayname) {
					var oldDisplayname = context.mutableProperties.displayname;
					if (displayname === oldDisplayname) {
						return;
					}
					context.mutableProperties.displayname = displayname;
					context.setUpdated('displayname');
					iface.emit(Calendar.hookDisplaynameChanged, displayname, oldDisplayname);
				}
			},
			enabled: {
				get: function() {
					return context.mutableProperties.enabled;
				},
				set: function(enabled) {
					var oldEnabled = context.mutableProperties.enabled;
					if (enabled === oldEnabled) {
						return;
					}
					context.mutableProperties.enabled = enabled;
					context.setUpdated('enabled');
					iface.emit(Calendar.hookEnabledChanged, enabled, oldEnabled);
				}
			},
			order: {
				get: function() {
					return context.mutableProperties.order;
				},
				set: function(order) {
					var oldOrder = context.mutableProperties.order;
					if (order === oldOrder) {
						return;
					}
					context.mutableProperties.order = order;
					context.setUpdated('order');
					iface.emit(Calendar.hookOrderChanged, order, oldOrder);
				}

			},
			components: {
				get: function() {
					return context.components;
				}
			},
			url: {
				get: function() {
					return context.url;
				}
			},
			caldav: {
				get: function() {
					return $window.location.origin + context.url;
				}
			},
			fcEventSource: {
				get: function() {
					return context.fcEventSource;
				}
			},
			shares: {
				get: function() {
					return context.shares;
				}
			},
			tmpId: {
				get: function() {
					return context.tmpId;
				}
			},
			warnings: {
				get: function() {
					return context.warnings;
				}
			},
			owner: {
				get: function() {
					return context.owner;
				}
			}
		});

		iface.hasUpdated = function() {
			return context.updatedProperties.length !== 0;
		};

		iface.getUpdated = function() {
			return context.updatedProperties;
		};

		iface.resetUpdated = function() {
			context.updatedProperties = [];
		};

		iface.addWarning = function(msg) {
			context.warnings.push(msg);
		};

		iface.hasWarnings = function() {
			return context.warnings.length > 0;
		};

		iface.resetWarnings = function() {
			context.warnings = [];
		};

		iface.toggleEnabled = function() {
			context.mutableProperties.enabled = !context.mutableProperties.enabled;
			context.setUpdated('enabled');
			iface.emit(Calendar.hookEnabledChanged, context.mutableProperties.enabled, !context.mutableProperties.enabled);
		};

		iface.isShared = function() {
			return context.shares.groups.length !== 0 ||
					context.shares.users.length !== 0;
		};

		iface.isPublished = function() {
			return false;
		};

		iface.isShareable = function() {
			return context.shareable;
		};

		iface.isPublishable = function() {
			return false;
		};

		iface.isRendering = function() {
			return context.fcEventSource.isRendering;
		};

		iface.isWritable = function() {
			return context.writable;
		};

		iface.arePropertiesWritable = function() {
			return context.writableProperties;
		};

		Object.assign(
			iface,
			Hook(context)
		);

		return iface;
	}

	Calendar.isCalendar = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isACalendarObject === true);
	};

	Calendar.hookFinishedRendering = 1;
	Calendar.hookColorChanged = 2;
	Calendar.hookDisplaynameChanged = 3;
	Calendar.hookEnabledChanged = 4;
	Calendar.hookOrderChanged = 5;

	return Calendar;
}]);

app.factory('FcEvent', ["SimpleEvent", function(SimpleEvent) {
	'use strict';

	/**
	 * check if dtstart and dtend are both of type date
	 * @param dtstart
	 * @param dtend
	 * @returns {boolean}
	 */
	function isEventAllDay (dtstart, dtend) {
		return (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
	}

	/**
	 * get recurrence id from event
	 * @param {Component} event
	 * @returns {string}
	 */
	function getRecurrenceIdFromEvent (event) {
		return event.hasProperty('recurrence-id') ?
			event.getFirstPropertyValue('recurrence-id').toICALString() :
			null;
	}

	/**
	 * get calendar related information about event
	 * @param vevent
	 * @returns {{calendar: *, editable: *, backgroundColor: *, borderColor: *, textColor: *, className: *[]}}
	 */
	function getCalendarRelatedProps (vevent) {
		return {
			calendar: vevent.calendar,
			editable: vevent.calendar.isWritable(),
			className: ['fcCalendar-id-' + vevent.calendar.tmpId]
		};
	}

	/**
	 * get event related information about event
	 * @param {Component} event
	 * @returns {{title: string}}
	 */
	function getEventRelatedProps (event) {
		return {
			title: event.getFirstPropertyValue('summary')
		};
	}

	/**
	 * get unique id for fullcalendar
	 * @param {VEvent} vevent
	 * @param {Component} event
	 * @returns {string}
	 */
	function getFcEventId (vevent, event) {
		var id = vevent.uri;
		var recurrenceId = getRecurrenceIdFromEvent(event);
		if (recurrenceId) {
			id += recurrenceId;
		}

		return id;
	}

	/**
	 * @constructor
	 * @param {VEvent} vevent
	 * @param {Component} event
	 * @param {icaltime} start
	 * @param {icaltime} end
	 */
	function FcEvent (vevent, event, start, end) {
		var iCalEvent = new ICAL.Event(event);

		angular.extend(this, {
			vevent: vevent,
			event: event,
			id: getFcEventId(vevent, event),
			allDay: isEventAllDay(start, end),
			start: start.toJSDate(),
			end: end.toJSDate(),
			repeating: iCalEvent.isRecurring()
		}, getCalendarRelatedProps(vevent), getEventRelatedProps(event));
	}

	FcEvent.prototype = {
		get backgroundColor() {
			return this.vevent.calendar.color;
		},
		get borderColor() {
			return this.vevent.calendar.color;

		},
		get textColor() {
			return this.vevent.calendar.textColor;
		},
		/**
		 * get SimpleEvent for current fcEvent
		 * @returns {SimpleEvent}
		 */
		getSimpleEvent: function () {
			return new SimpleEvent(this.event);
		},
		/**
		 * moves the event to a different position
		 * @param {Duration} delta
		 */
		drop: function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (this.event.hasProperty('dtstart')) {
				var dtstart = this.event.getFirstPropertyValue('dtstart');
				dtstart.addDuration(delta);
				this.event.updatePropertyWithValue('dtstart', dtstart);
			}

			if (this.event.hasProperty('dtend')) {
				var dtend = this.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				this.event.updatePropertyWithValue('dtend', dtend);
			}
		},
		/**
		 * resizes the event
		 * @param {moment.duration} delta
		 */
		resize: function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (this.event.hasProperty('duration')) {
				var duration = this.event.getFirstPropertyValue('duration');
				duration.fromSeconds((delta.toSeconds() + duration.toSeconds()));
				this.event.updatePropertyWithValue('duration', duration);
			} else if (this.event.hasProperty('dtend')) {
				var dtend = this.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				this.event.updatePropertyWithValue('dtend', dtend);
			} else if (this.event.hasProperty('dtstart')) {
				var dtstart = event.getFirstPropertyValue('dtstart').clone();
				dtstart.addDuration(delta);
				this.event.addPropertyWithValue('dtend', dtstart);
			}
		}
	};

	return FcEvent;
}]);

app.factory('Hook', function() {
	'use strict';

	return function Hook(context) {
		context.hooks = {};
		const iface = {};
		
		iface.emit = function(identifier, newValue, oldValue) {
			if (Array.isArray(context.hooks[identifier])) {
				context.hooks[identifier].forEach(function(callback) {
					callback(newValue, oldValue);
				});
			}
		};
		
		iface.register = function(identifier, callback) {
			context.hooks[identifier] = context.hooks[identifier] || [];
			context.hooks[identifier].push(callback);
		};

		return iface;
	};
});

app.factory('ImportFileWrapper', ["Hook", "SplitterService", function(Hook, SplitterService) {
	'use strict';

	function ImportFileWrapper(file) {
		const context = {
			file: file,
			splittedICal: null,
			selectedCalendar: null,
			state: 0,
			errors: 0,
			progress: 0,
			progressToReach: 0
		};
		const iface = {
			_isAImportFileWrapperObject: true
		};

		context.checkIsDone = function() {
			if (context.progress === context.progressToReach) {
				context.state = ImportFileWrapper.stateDone;
				iface.emit(ImportFileWrapper.hookDone);
			}
		};

		Object.defineProperties(iface, {
			file: {
				get: function() {
					return context.file;
				}
			},
			splittedICal: {
				get: function() {
					return context.splittedICal;
				}
			},
			selectedCalendar: {
				get: function() {
					return context.selectedCalendar;
				},
				set: function(selectedCalendar) {
					context.selectedCalendar = selectedCalendar;
				}
			},
			state: {
				get: function() {
					return context.state;
				},
				set: function(state) {
					if (typeof state === 'number') {
						context.state = state;
					}
				}
			},
			errors: {
				get: function() {
					return context.errors;
				},
				set: function(errors) {
					if (typeof errors === 'number') {
						var oldErrors = context.errors;
						context.errors = errors;
						iface.emit(ImportFileWrapper.hookErrorsChanged, errors, oldErrors);
					}
				}
			},
			progress: {
				get: function() {
					return context.progress;
				},
				set: function(progress) {
					if (typeof progress === 'number') {
						var oldProgress = context.progress;
						context.progress = progress;
						iface.emit(ImportFileWrapper.hookProgressChanged, progress, oldProgress);

						context.checkIsDone();
					}
				}
			},
			progressToReach: {
				get: function() {
					return context.progressToReach;
				}
			}
		});

		iface.wasCanceled = function() {
			return context.state === ImportFileWrapper.stateCanceled;
		};

		iface.isAnalyzing = function() {
			return context.state === ImportFileWrapper.stateAnalyzing;
		};

		iface.isAnalyzed = function() {
			return context.state === ImportFileWrapper.stateAnalyzed;
		};

		iface.isScheduled = function() {
			return context.state === ImportFileWrapper.stateScheduled;
		};

		iface.isImporting = function() {
			return context.state === ImportFileWrapper.stateImporting;
		};

		iface.isDone = function() {
			return context.state === ImportFileWrapper.stateDone;
		};

		iface.hasErrors = function() {
			return context.errors > 0;
		};

		iface.read = function(afterReadCallback) {
			var reader = new FileReader();

			reader.onload = function(event) {
				context.splittedICal = SplitterService.split(event.target.result);
				context.progressToReach = context.splittedICal.vevents.length +
					context.splittedICal.vjournals.length +
					context.splittedICal.vtodos.length;
				afterReadCallback();
				iface.state = ImportFileWrapper.stateAnalyzed;
			};

			reader.readAsText(file);
		};

		Object.assign(
			iface,
			Hook(context)
		);

		return iface;
	}

	ImportFileWrapper.isImportWrapper = function(obj) {
		return obj instanceof ImportFileWrapper || (typeof obj === 'object' && obj !== null && obj._isAImportFileWrapperObject !== null);
	};

	ImportFileWrapper.stateCanceled = -1;
	ImportFileWrapper.stateAnalyzing = 0;
	ImportFileWrapper.stateAnalyzed = 1;
	ImportFileWrapper.stateScheduled = 2;
	ImportFileWrapper.stateImporting = 3;
	ImportFileWrapper.stateDone = 4;

	ImportFileWrapper.hookProgressChanged = 1;
	ImportFileWrapper.hookDone = 2;
	ImportFileWrapper.hookErrorsChanged = 3;

	return ImportFileWrapper;
}]);

app.factory('SimpleEvent', function() {
	'use strict';

	/**
	 * structure of simple data
	 */
	var defaults = {
		'summary': null,
		'location': null,
		//'created': null,
		//'last-modified': null,
		'organizer': null,
		'class': null,
		'description': null,
		//'url': null,
		'status': null,
		//'resources': null,
		'alarm': null,
		'attendee': null,
		//'categories': null,
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

	var organizerParameters = [
		'cn'
	];

	/**
	 * parsers of supported properties
	 */
	var simpleParser = {
		date: function(data, vevent, key, parameters) {
			parameters = (parameters || []).concat(['tzid']);
			simpleParser._parseSingle(data, vevent, key, parameters, function(p) {
				return (p.type === 'duration') ?
					p.getFirstValue().toSeconds():
					moment(p.getFirstValue().toJSDate());
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
							values[vKey].toSeconds():
							moment(values[vKey].toJSDate())
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

				var currentElement = {
					group: group,
					parameters: simpleParser._parseParameters(properties[pKey], parameters),
					type: properties[pKey].type
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
					return ICAL.Time.fromJSDate(v.value.toDate());
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
						values.push(ICAL.Time.fromJSDate(v.values[i].toDate()));
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
						if (parseInt(groupId) === newSimpleData[key][j].group) {
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
				if (oldGroups.indexOf(parseInt(groupId)) !== -1) {
					vevent.removeProperty(properties[pKey]);
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
		'location': {parser: simpleParser.string, reader: simpleReader.string},
		//'created': {parser: simpleParser.date, reader: simpleReader.date},
		//'last-modified': {parser: simpleParser.date, reader: simpleReader.date},
		//'categories': {parser: simpleParser.strings, reader: simpleReader.strings},
		//attendees
		'attendee': {parser: simpleParser.strings, reader: simpleReader.strings, parameters: attendeeParameters},
		'organizer': {parser: simpleParser.string, reader: simpleReader.string, parameters: organizerParameters},
		//sharing
		'class': {parser: simpleParser.string, reader: simpleReader.string},
		//other
		'description': {parser: simpleParser.string, reader: simpleReader.string},
		//'url': {parser: simpleParser.string, reader: simpleReader.string},
		'status': {parser: simpleParser.string, reader: simpleReader.string}
		//'resources': {parser: simpleParser.strings, reader: simpleReader.strings}
	};

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
				//simpleParser.strings(alarmData, alarm, 'attendee', attendeeParameters);

				if (alarmData.trigger.type === 'duration' && alarm.hasProperty('trigger')) {
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
			var dtstart = vevent.getFirstPropertyValue('dtstart'), dtend;
			if (vevent.hasProperty('dtend')) {
				dtend = vevent.getFirstPropertyValue('dtend');
			} else if (vevent.hasProperty('duration')) {
				dtend = dtstart.clone();
				dtend.addDuration(vevent.getFirstPropertyValue('duration'));
			} else {
				dtend = dtstart.clone();
			}

			data.dtstart = {
				parameters: {
					zone: dtstart.zone.toString()
				},
				type: dtstart.icaltype,
				value: moment({years: dtstart.year, months: dtstart.month - 1, date: dtstart.day,
					hours: dtstart.hour, minutes: dtstart.minute, seconds: dtstart.seconds})
			};
			data.dtend = {
				parameters: {
					zone: dtend.zone.toString()
				},
				type: dtend.icaltype,
				value: moment({years: dtend.year, months: dtend.month - 1, date: dtend.day,
					hours: dtend.hour, minutes: dtend.minute, seconds: dtend.seconds})
			};
			data.allDay = (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
		},
		repeating: function(data, vevent) {
			var iCalEvent = new ICAL.Event(vevent);

			data.repeating = iCalEvent.isRecurring();

			var rrule = vevent.getFirstPropertyValue('rrule');
			if (rrule) {
				data.rrule = {
					count: rrule.count,
					freq: rrule.freq,
					interval: rrule.interval,
					parameters: rrule.parts,
					until: null
				};

				/*if (rrule.until) {
				 simpleParser.date(data.rrule, rrule, 'until');
				 }*/
			} else {
				data.rrule = {
					freq: 'NONE'
				};
			}
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

					components = vevent.getAllSubcomponents('valarm');
					for (cKey in components) {
						if (!components.hasOwnProperty(cKey)) {
							continue;
						}

						groupId = components[cKey].getFirstProperty('action').getParameter('x-oc-group-id');
						if (groupId === null) {
							continue;
						}
						if (groupId === newSimpleData[key][j].group.toString()) {
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
			vevent.removeAllProperties('dtstart');
			vevent.removeAllProperties('dtend');
			vevent.removeAllProperties('duration');

			newSimpleData.dtstart.parameters.zone = newSimpleData.dtstart.parameters.zone || 'floating';
			newSimpleData.dtend.parameters.zone = newSimpleData.dtend.parameters.zone || 'floating';

			if (newSimpleData.dtstart.parameters.zone !== 'floating' &&
				!ICAL.TimezoneService.has(newSimpleData.dtstart.parameters.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtstart.parameters.zone
				};
			}
			if (newSimpleData.dtend.parameters.zone !== 'floating' &&
				!ICAL.TimezoneService.has(newSimpleData.dtend.parameters.zone)) {
				throw {
					kind: 'timezone_missing',
					missing_timezone: newSimpleData.dtend.parameters.zone
				};
			}

			var start = ICAL.Time.fromJSDate(newSimpleData.dtstart.value.toDate(), false);
			start.isDate = newSimpleData.allDay;
			var end = ICAL.Time.fromJSDate(newSimpleData.dtend.value.toDate(), false);
			end.isDate = newSimpleData.allDay;

			var availableTimezones = [];
			var vtimezones = vevent.parent.getAllSubcomponents('vtimezone');
			angular.forEach(vtimezones, function(vtimezone) {
				availableTimezones.push(vtimezone.getFirstPropertyValue('tzid'));
			});

			var dtstart = new ICAL.Property('dtstart', vevent);
			dtstart.setValue(start);
			if (newSimpleData.dtstart.parameters.zone !== 'floating') {
				dtstart.setParameter('tzid', newSimpleData.dtstart.parameters.zone);
				var startTz = ICAL.TimezoneService.get(newSimpleData.dtstart.parameters.zone);
				start.zone = startTz;
				if (availableTimezones.indexOf(newSimpleData.dtstart.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(startTz.component);
					availableTimezones.push(newSimpleData.dtstart.parameters.zone);
				}
			}

			var dtend = new ICAL.Property('dtend', vevent);
			dtend.setValue(end);
			if (newSimpleData.dtend.parameters.zone !== 'floating') {
				dtend.setParameter('tzid', newSimpleData.dtend.parameters.zone);
				var endTz = ICAL.TimezoneService.get(newSimpleData.dtend.parameters.zone);
				end.zone = endTz;
				if (availableTimezones.indexOf(newSimpleData.dtend.parameters.zone) === -1) {
					vevent.parent.addSubcomponent(endTz.component);
				}
			}

			vevent.addProperty(dtstart);
			vevent.addProperty(dtend);
		},
		repeating: function(vevent, oldSimpleData, newSimpleData) {
			// We won't support exrule, because it's deprecated and barely used in the wild
			if (newSimpleData.rrule === null || newSimpleData.rrule.freq === 'NONE') {
				vevent.removeAllProperties('rdate');
				vevent.removeAllProperties('rrule');
				vevent.removeAllProperties('exdate');

				return;
			}

			if (newSimpleData.rrule.dontTouch) {
				return;
			}

			var params = {
				interval: newSimpleData.rrule.interval,
				freq: newSimpleData.rrule.freq
			};

			if (newSimpleData.rrule.count) {
				params.count = newSimpleData.rrule.count;
			}

			var rrule = new ICAL.Recur(params);
			vevent.updatePropertyWithValue('rrule', rrule);
		}
	};

	function SimpleEvent(event) {
		this._event = event;
		angular.extend(this, defaults);

		var parser, parameters;
		for (var key in simpleProperties) {
			if (!simpleProperties.hasOwnProperty(key)) {
				continue;
			}

			parser = simpleProperties[key].parser;
			parameters = simpleProperties[key].parameters;
			if (this._event.hasProperty(key)) {
				parser(this, this._event, key, parameters);
			}
		}

		for (parser in specificParser) {
			if (!specificParser.hasOwnProperty(parser)) {
				continue;
			}

			specificParser[parser](this, this._event);
		}

		this._generateOldProperties();
	}

	SimpleEvent.prototype = {
		_generateOldProperties: function() {
			this._oldProperties = {};

			for (var def in defaults) {
				if (!defaults.hasOwnProperty(def)) {
					continue;
				}

				this._oldProperties[def] = angular.copy(this[def]);
			}
		},
		patch: function() {
			var key, reader, parameters;

			for (key in simpleProperties) {
				if (!simpleProperties.hasOwnProperty(key)) {
					continue;
				}

				reader = simpleProperties[key].reader;
				parameters = simpleProperties[key].parameters;
				if (this._oldProperties[key] !== this[key]) {
					if (this[key] === null) {
						this._event.removeAllProperties(key);
					} else {
						reader(this._event, this._oldProperties, this, key, parameters);
					}
				}
			}

			for (key in specificReader) {
				if (!specificReader.hasOwnProperty(key)) {
					continue;
				}

				reader = specificReader[key];
				reader(this._event, this._oldProperties, this);
			}

			this._generateOldProperties();
		}
	};

	return SimpleEvent;
});

app.factory('SplittedICal', function() {
	'use strict';

	function SplittedICal (name, color) {
		const context = {
			name: name,
			color: color,
			vevents: [],
			vjournals: [],
			vtodos: []
		};
		const iface = {
			_isASplittedICalObject: true
		};

		Object.defineProperties(iface, {
			name: {
				get: function() {
					return context.name;
				}
			},
			color: {
				get: function() {
					return context.color;
				}
			},
			vevents: {
				get: function() {
					return context.vevents;
				}
			},
			vjournals: {
				get: function() {
					return context.vjournals;
				}
			},
			vtodos: {
				get: function() {
					return context.vtodos;
				}
			},
			objects: {
				get: function() {
					return []
						.concat(context.vevents)
						.concat(context.vjournals)
						.concat(context.vtodos);
				}
			}
		});

		iface.addObject = function(componentName, object) {
			switch(componentName) {
				case 'vevent':
					context.vevents.push(object);
					break;

				case 'vjournal':
					context.vjournals.push(object);
					break;

				case 'vtodo':
					context.vtodos.push(object);
					break;

				default:
					break;
			}
		};

		return iface;
	}

	SplittedICal.isSplittedICal = function(obj) {
		return obj instanceof SplittedICal || (typeof obj === 'object' && obj !== null && obj._isASplittedICalObject !== null);
	};

	return SplittedICal;
});

app.factory('Timezone',
	function() {
		'use strict';

		var timezone = function Timezone(data) {
			angular.extend(this, {
				_props: {}
			});

			if (data instanceof ICAL.Timezone) {
				this._props.jCal = data;
				this._props.name = data.tzid;
			} else if (typeof data === 'string') {
				var jCal = ICAL.parse(data);
				var components = new ICAL.Component(jCal);
				var iCalTimezone = null;
				if (components.name === 'vtimezone') {
					iCalTimezone = new ICAL.Timezone(components);
				} else {
					iCalTimezone = new ICAL.Timezone(components.getFirstSubcomponent('vtimezone'));
				}
				this._props.jCal = iCalTimezone;
				this._props.name = iCalTimezone.tzid;
			}
		};

		//Timezones are immutable
		timezone.prototype = {
			get jCal() {
				return this._props.jCal;
			},
			get name() {
				return this._props.name;
			}
		};

		return timezone;
	}
);

app.factory('VEvent', ["FcEvent", "SimpleEvent", "ICalFactory", "RandomStringService", function(FcEvent, SimpleEvent, ICalFactory, RandomStringService) {
	'use strict';

	/**
	 * get DTEND from vevent
	 * @param {ICAL.Component} vevent
	 * @returns {ICAL.Time}
	 */
	function calculateDTEnd(vevent) {
		if (vevent.hasProperty('dtend')) {
			return vevent.getFirstPropertyValue('dtend');
		} else if (vevent.hasProperty('duration')) {
			var dtstart = vevent.getFirstPropertyValue('dtstart').clone();
			dtstart.addDuration(vevent.getFirstPropertyValue('duration'));
			return dtstart;
		} else {
			return vevent.getFirstPropertyValue('dtstart').clone();
		}
	}

	/**
	 * check if we need to convert the timezone of either dtstart or dtend
	 * @param {ICAL.Time} dt
	 * @returns {boolean}
	 */
	function isTimezoneConversionNecessary(dt) {
		return (dt.icaltype !== 'date' &&
		dt.zone !== ICAL.Timezone.utcTimezone &&
		dt.zone !== ICAL.Timezone.localTimezone);
	}

	/**
	 * convert a dt's timezone if necessary
	 * @param {ICAL.Time} dt
	 * @param {ICAL.Component} timezone
	 * @returns {ICAL.Time}
	 */
	function convertTimezoneIfNecessary(dt, timezone) {
		if (isTimezoneConversionNecessary(dt) && timezone) {
			dt = dt.convertToZone(timezone);
		}

		return dt;
	}

	/**
	 * parse an recurring event
	 * @param vevent
	 * @param event
	 * @param start
	 * @param end
	 * @param timezone
	 * @return []
	 */
	function getTimeForRecurring(vevent, event, start, end, timezone) {
		var dtstart = event.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(event);
		var duration = dtend.subtractDate(dtstart);
		var fcEvents = [];

		var iterator = new ICAL.RecurExpansion({
			component: event,
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

			var singleDtStart = next.clone();
			var singleDtEnd = next.clone();
			singleDtEnd.addDuration(duration);

			fcEvents.push(new FcEvent(vevent, event,
				convertTimezoneIfNecessary(singleDtStart, timezone),
				convertTimezoneIfNecessary(singleDtEnd, timezone)));
		}

		return fcEvents;
	}

	/**
	 * parse a single event
	 * @param vevent
	 * @param event
	 * @param timezone
	 * @returns {FcEvent}
	 */
	function getTime(vevent, event, timezone) {
		var dtstart = event.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(event);

		return new FcEvent(vevent, event,
			convertTimezoneIfNecessary(dtstart, timezone),
			convertTimezoneIfNecessary(dtend, timezone));
	}

	/**
	 * register timezones from ical response
	 * @param {ICAL.Component} components
	 */
	function registerTimezones(components) {
		var vtimezones = components.getAllSubcomponents('vtimezone');
		angular.forEach(vtimezones, function (vtimezone) {
			var timezone = new ICAL.Timezone(vtimezone);
			ICAL.TimezoneService.register(timezone.tzid, timezone);
		});
	}

	/**
	 * @constructor
	 * @param {Calendar} calendar
	 * @param {string|ICAL.Component} ical
	 * @param {string|null} etag
	 * @param {string|null} uri
	 * @constructor
	 */
	function VEvent(calendar, ical, etag, uri) {
		if (typeof ical === 'string') {
			try {
				var jcal = ICAL.parse(ical);
				this.comp = new ICAL.Component(jcal);
			} catch (e) {
				console.log(e);
				throw VEvent.INVALID;
			}
		} else if (Object.getPrototypeOf(ical) === ICAL.Component.prototype) {
			this.comp = ical;
		}

		if (!this.comp || this.comp.jCal.length === 0) {
			throw VEvent.INVALID;
		}

		registerTimezones(this.comp);

		angular.extend(this, {
			calendar: calendar,
			etag: etag,
			uri: uri
		});
	}

	VEvent.prototype = {
		/**
		 * serialize jsical object to actual ical data
		 * @returns {String}
		 */
		get data() {
			return this.comp.toString();
		},
		/**
		 *
		 * @param start
		 * @param end
		 * @param timezone
		 * @returns {Array}
		 */
		getFcEvent: function(start, end, timezone) {
			var iCalStart = ICAL.Time.fromJSDate(start.toDate());
			var iCalEnd = ICAL.Time.fromJSDate(end.toDate());
			var renderedEvents = [], self = this;

			var vevents = this.comp.getAllSubcomponents('vevent');
			angular.forEach(vevents, function (event) {
				var iCalEvent = new ICAL.Event(event);

				if (!event.hasProperty('dtstart')) {
					return;
				}

				if (iCalEvent.isRecurring()) {
					angular.extend(renderedEvents,
						getTimeForRecurring(self, event, iCalStart, iCalEnd, timezone.jCal));
				} else {
					renderedEvents.push(getTime(self, event, timezone.jCal));
				}
			});

			return renderedEvents;
		},
		/**
		 *
		 * @param recurrenceId
		 * @returns {SimpleEvent}
		 */
		getSimpleEvent: function(recurrenceId) {
			var vevents = this.comp.getAllSubcomponents('vevent'), simpleEvent = null;

			angular.forEach(vevents, function (event) {
				var hasRecurrenceId = event.hasProperty('recurrence-id');
				if ((!hasRecurrenceId && recurrenceId === null) ||
					(hasRecurrenceId && recurrenceId === event.getFirstPropertyValue('recurrence-id'))) {
					simpleEvent = new SimpleEvent(event);
				}
			});

			return simpleEvent;
		}
	};

	/**
	 *
	 * @param start
	 * @param end
	 * @param timezone
	 * @returns {VEvent}
	 */
	VEvent.fromStartEnd = function(start, end, timezone) {
		var comp = ICalFactory.new();

		var iCalEvent = new ICAL.Component('vevent');
		comp.addSubcomponent(iCalEvent);
		iCalEvent.updatePropertyWithValue('created', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('last-modified', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('uid', RandomStringService.generate());
		// add a dummy dtstart to make the ical valid before we create SimpleEvent
		iCalEvent.updatePropertyWithValue('dtstart', ICAL.Time.now());

		var uri = RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		var vevent = new VEvent(null, comp, null, uri);
		var simple = new SimpleEvent(iCalEvent);
		angular.extend(simple, {
			allDay: !start.hasTime() && !end.hasTime(),
			dtstart: {
				type: start.hasTime() ? 'datetime' : 'date',
				value: start,
				parameters: {
					zone: timezone
				}
			},
			dtend: {
				type: end.hasTime() ? 'datetime' : 'date',
				value: end,
				parameters: {
					zone: timezone
				}
			}
		});
		simple.patch();

		return vevent;
	};

	/**
	 *
	 * @type {string}
	 */
	VEvent.INVALID = 'INVALID_EVENT';

	return VEvent;
}]);

app.service('AutoCompletionService', ['$rootScope', '$http',
	function ($rootScope, $http) {
		'use strict';

		return {
			searchAttendee: function(name) {
				return $http.get($rootScope.baseUrl + 'autocompletion/attendee', {
					params: {
						search: name
					}
				}).then(function (response) {
					return response.data;
				});
			},
			searchLocation: function(address) {
			return $http.get($rootScope.baseUrl + 'autocompletion/location', {
				params: {
					location: address
				}
			}).then(function (response) {
				return response.data;
			});
			}
		};
	}
]);
app.service('CalendarService', ['DavClient', 'Calendar', function(DavClient, Calendar){
	'use strict';

	var self = this;

	this._CALENDAR_HOME = null;

	this._currentUserPrincipal = null;

	this._takenUrls = [];

	this._PROPERTIES = [
		'{' + DavClient.NS_DAV + '}displayname',
		'{' + DavClient.NS_IETF + '}calendar-description',
		'{' + DavClient.NS_IETF + '}calendar-timezone',
		'{' + DavClient.NS_APPLE + '}calendar-order',
		'{' + DavClient.NS_APPLE + '}calendar-color',
		'{' + DavClient.NS_IETF + '}supported-calendar-component-set',
		'{' + DavClient.NS_OWNCLOUD + '}calendar-enabled',
		'{' + DavClient.NS_DAV + '}acl',
		'{' + DavClient.NS_DAV + '}owner',
		'{' + DavClient.NS_OWNCLOUD + '}invite'
	];

	this._xmls = new XMLSerializer();

	function discoverHome(callback) {
		return DavClient.propFind(DavClient.buildUrl(OC.linkToRemoteBase('dav')), ['{' + DavClient.NS_DAV + '}current-user-principal'], 0, {'requesttoken': OC.requestToken}).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying current-user-principal failed";
			}

			if (response.body.propStat.length < 1) {
				return;
			}
			var props = response.body.propStat[0].properties;
			self._currentUserPrincipal = props['{' + DavClient.NS_DAV + '}current-user-principal'][0].textContent;

			return DavClient.propFind(DavClient.buildUrl(self._currentUserPrincipal), ['{' + DavClient.NS_IETF + '}calendar-home-set'], 0, {'requesttoken': OC.requestToken}).then(function (response) {
				if (!DavClient.wasRequestSuccessful(response.status)) {
					throw "CalDAV client could not be initialized - Querying calendar-home-set failed";
				}

				if (response.body.propStat.length < 1) {
					return;
				}
				var props = response.body.propStat[0].properties;
				self._CALENDAR_HOME = props['{' + DavClient.NS_IETF + '}calendar-home-set'][0].textContent;

				return callback();
			});
		});
	}

	function getResponseCodeFromHTTPResponse(t) {
		return parseInt(t.split(' ')[1]);
	}

	this.getAll = function() {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.getAll();
			});
		}

		return DavClient.propFind(DavClient.buildUrl(this._CALENDAR_HOME), this._PROPERTIES, 1, {'requesttoken': OC.requestToken}).then(function(response) {
			var calendars = [];

			if (!DavClient.wasRequestSuccessful(response.status)) {
				throw "CalDAV client could not be initialized - Querying calendars failed";
			}

			for (var i = 0; i < response.body.length; i++) {
				var body = response.body[i];
				if (body.propStat.length < 1) {
					continue;
				}

				self._takenUrls.push(body.href);

				var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
				if (!DavClient.wasRequestSuccessful(responseCode)) {
					continue;
				}

				var props = self._getSimplePropertiesFromRequest(body.propStat[0].properties);
				if (!props || !props.components.vevent) {
					continue;
				}

				var calendar = Calendar(body.href, props);
				calendars.push(calendar);
			}

			return calendars;
		});
	};

	this.get = function(url) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.get(url);
			});
		}

		return DavClient.propFind(DavClient.buildUrl(url), this._PROPERTIES, 0, {'requesttoken': OC.requestToken}).then(function(response) {
			var body = response.body;
			if (body.propStat.length < 1) {
				//TODO - something went wrong
				return;
			}

			var responseCode = getResponseCodeFromHTTPResponse(body.propStat[0].status);
			if (!DavClient.wasRequestSuccessful(responseCode)) {
				//TODO - something went wrong
				return;
			}

			var props = self._getSimplePropertiesFromRequest(body.propStat[0].properties);
			if (!props || !props.components.vevent) {
				return;
			}

			return Calendar(body.href, props);
		});
	};

	this.create = function(name, color, components) {
		if (this._CALENDAR_HOME === null) {
			return discoverHome(function() {
				return self.create(name, color);
			});
		}

		if (typeof components === 'undefined') {
			components = ['vevent', 'vtodo'];
		}

		var xmlDoc = document.implementation.createDocument('', '', null);
		var cMkcalendar = xmlDoc.createElement('d:mkcol');
		cMkcalendar.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cMkcalendar.setAttribute('xmlns:d', 'DAV:');
		cMkcalendar.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cMkcalendar.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cMkcalendar);

		var dSet = xmlDoc.createElement('d:set');
		cMkcalendar.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		var dResourceType = xmlDoc.createElement('d:resourcetype');
		dProp.appendChild(dResourceType);

		var dCollection = xmlDoc.createElement('d:collection');
		dResourceType.appendChild(dCollection);

		var cCalendar = xmlDoc.createElement('c:calendar');
		dResourceType.appendChild(cCalendar);

		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'displayname', name));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'enabled', true));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'color', color));
		dProp.appendChild(this._createXMLForProperty(xmlDoc, 'components', components));

		var body = this._xmls.serializeToString(cMkcalendar);

		var uri = this._suggestUri(name);
		var url = this._CALENDAR_HOME + uri + '/';
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('MKCOL', url, headers, body).then(function(response) {
			if (response.status === 201) {
				self._takenUrls.push(url);
				return self.get(url).then(function(calendar) {
					calendar.enabled = true;
					return self.update(calendar);
				});
			}
		});
	};

	this.update = function(calendar) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var dPropUpdate = xmlDoc.createElement('d:propertyupdate');
		dPropUpdate.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		dPropUpdate.setAttribute('xmlns:d', 'DAV:');
		dPropUpdate.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		dPropUpdate.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(dPropUpdate);

		var dSet = xmlDoc.createElement('d:set');
		dPropUpdate.appendChild(dSet);

		var dProp = xmlDoc.createElement('d:prop');
		dSet.appendChild(dProp);

		var updatedProperties = calendar.getUpdated();
		if (updatedProperties.length === 0) {
			//nothing to do here
			return calendar;
		}
		for (var i=0; i < updatedProperties.length; i++) {
			dProp.appendChild(this._createXMLForProperty(
				xmlDoc,
				updatedProperties[i],
				calendar[updatedProperties[i]]
			));
		}

		calendar.resetUpdated();

		var url = calendar.url;
		var body = this._xmls.serializeToString(dPropUpdate);
		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			'requesttoken' : OC.requestToken
		};

		return DavClient.request('PROPPATCH', url, headers, body).then(function(response) {
			return calendar;
		});
	};

	this.delete = function(calendar) {
		return DavClient.request('DELETE', calendar.url, {'requesttoken': OC.requestToken}, '').then(function(response) {
			if (response.status === 204) {
				return true;
			} else {
				// TODO - handle error case
				return false;
			}
		});
	};

	this.share = function(calendar, shareType, shareWith, writable, existingShare) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oSet = xmlDoc.createElement('o:set');
		oShare.appendChild(oSet);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oSet.appendChild(dHref);

		var oSummary = xmlDoc.createElement('o:summary');
		oSummary.textContent = t('calendar', '{calendar} shared by {owner}', {
			calendar: calendar.displayname,
			owner: calendar.owner
		});
		oSet.appendChild(oSummary);

		if (writable) {
			var oRW = xmlDoc.createElement('o:read-write');
			oSet.appendChild(oRW);
		}

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (!existingShare) {
					if (shareType === OC.Share.SHARE_TYPE_USER) {
						calendar.shares.users.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
						calendar.shares.groups.push({
							id: shareWith,
							displayname: shareWith,
							writable: writable
						});
					}
				}
			}
		});
	};

	this.unshare = function(calendar, shareType, shareWith) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var oShare = xmlDoc.createElement('o:share');
		oShare.setAttribute('xmlns:d', 'DAV:');
		oShare.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(oShare);

		var oRemove = xmlDoc.createElement('o:remove');
		oShare.appendChild(oRemove);

		var dHref = xmlDoc.createElement('d:href');
		if (shareType === OC.Share.SHARE_TYPE_USER) {
			dHref.textContent = 'principal:principals/users/';
		} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
			dHref.textContent = 'principal:principals/groups/';
		}
		dHref.textContent += shareWith;
		oRemove.appendChild(dHref);

		var headers = {
			'Content-Type' : 'application/xml; charset=utf-8',
			requesttoken : oc_requesttoken
		};
		var body = this._xmls.serializeToString(oShare);
		return DavClient.request('POST', calendar.url, headers, body).then(function(response) {
			if (response.status === 200) {
				if (shareType === OC.Share.SHARE_TYPE_USER) {
					calendar.shares.users = calendar.shares.users.filter(function(user) {
						return user.id !== shareWith;
					});
				} else if (shareType === OC.Share.SHARE_TYPE_GROUP) {
					calendar.shares.groups = calendar.shares.groups.filter(function(groups) {
						return groups.id !== shareWith;
					});
				}
				//todo - remove entry from calendar object
				return true;
			} else {
				return false;
			}
		});
	};

	this._createXMLForProperty = function(xmlDoc, propName, value) {
		switch(propName) {
			case 'enabled':
				var oEnabled = xmlDoc.createElement('o:calendar-enabled');
				oEnabled.textContent = value ? '1' : '0';
				return oEnabled;

			case 'displayname':
				var dDisplayname = xmlDoc.createElement('d:displayname');
				dDisplayname.textContent = value;
				return dDisplayname;

			case 'order':
				var aOrder = xmlDoc.createElement('a:calendar-order');
				aOrder.textContent = value;
				return aOrder;

			case 'color':
				var aColor = xmlDoc.createElement('a:calendar-color');
				aColor.textContent = value;
				return aColor;

			case 'components':
				var cComponents = xmlDoc.createElement('c:supported-calendar-component-set');
				for (var i=0; i < value.length; i++) {
					var cComp = xmlDoc.createElement('c:comp');
					cComp.setAttribute('name', value[i].toUpperCase());
					cComponents.appendChild(cComp);
				}
				return cComponents;
		}
	};

	this._getSimplePropertiesFromRequest = function(props) {
		if (!props['{' + DavClient.NS_IETF + '}supported-calendar-component-set']) {
			return;
		}

		this._getACLFromResponse(props);

		var simple = {
			enabled: props['{' + DavClient.NS_OWNCLOUD + '}calendar-enabled'] === '1',
			displayname: props['{' + DavClient.NS_DAV + '}displayname'],
			color: props['{' + DavClient.NS_APPLE + '}calendar-color'],
			order: props['{' + DavClient.NS_APPLE + '}calendar-order'],
			components: {
				vevent: false,
				vjournal: false,
				vtodo: false
			},
			owner: null,
			shareable: props.canWrite,
			shares: {
				users: [],
				groups: []
			},
			writable: props.canWrite
		};

		var components = props['{' + DavClient.NS_IETF + '}supported-calendar-component-set'];
		for (var i=0; i < components.length; i++) {
			var name = components[i].attributes.getNamedItem('name').textContent.toLowerCase();
			if (simple.components.hasOwnProperty(name)) {
				simple.components[name] = true;
			}
		}

		var owner = props['{' + DavClient.NS_DAV + '}owner'];
		if (typeof owner !== 'undefined' && owner.length !== 0) {
			owner = owner[0].textContent.slice(0, -1);
			if (owner.indexOf('/remote.php/dav/principals/users/') !== -1) {
				simple.owner = owner.substr(33 + owner.indexOf('/remote.php/dav/principals/users/'));
			}
		}

		var shares = props['{' + DavClient.NS_OWNCLOUD + '}invite'];
		if (typeof shares !== 'undefined') {
			for (var j=0; j < shares.length; j++) {
				var href = shares[j].getElementsByTagNameNS('DAV:', 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;

				var access = shares[j].getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'access');
				if (access.length === 0) {
					continue;
				}
				access = access[0];

				var readWrite = access.getElementsByTagNameNS(DavClient.NS_OWNCLOUD, 'read-write');
				readWrite = readWrite.length !== 0;

				if (href.startsWith('principal:principals/users/')) {
					simple.shares.users.push({
						id: href.substr(27),
						displayname: href.substr(27),
						writable: readWrite
					});
				} else if (href.startsWith('principal:principals/groups/')) {
					simple.shares.groups.push({
						id: href.substr(28),
						displayname: href.substr(28),
						writable: readWrite
					});
				}
			}
		}

		if (typeof simple.enabled === 'undefined') {
			if (typeof simple.owner !== 'undefined') {
				simple.enabled = simple.owner === oc_current_user;
			} else {
				simple.enabled = false;
			}
		}
		if (typeof simple.color !== 'undefined') {
			if (simple.color.length === 9) {
				simple.color = simple.color.substr(0,7);
			}
		} else {
			simple.color = '#1d2d44';
		}

		simple.writableProperties = (oc_current_user === simple.owner) && simple.writable;

		return simple;
	};

	this._getACLFromResponse = function(props) {
		var canWrite = false;
		var acl = props['{' + DavClient.NS_DAV + '}acl'];
		if (acl) {
			for (var k=0; k < acl.length; k++) {
				var href = acl[k].getElementsByTagNameNS(DavClient.NS_DAV, 'href');
				if (href.length === 0) {
					continue;
				}
				href = href[0].textContent;
				if (href !== self._currentUserPrincipal) {
					continue;
				}
				var writeNode = acl[k].getElementsByTagNameNS(DavClient.NS_DAV, 'write');
				if (writeNode.length > 0) {
					canWrite = true;
				}
			}
		}
		props.canWrite = canWrite;
	};

	this._isUriAlreadyTaken = function(uri) {
		return (this._takenUrls.indexOf(this._CALENDAR_HOME + uri + '/') !== -1);
	};

	this._suggestUri = function(displayname) {
		var uri = displayname.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text

		if (!this._isUriAlreadyTaken(uri)) {
			return uri;
		}

		if (uri.indexOf('-') === -1) {
			uri = uri + '-1';
			if (!this._isUriAlreadyTaken(uri)) {
				return uri;
			}
		}

		while (this._isUriAlreadyTaken(uri)) {
			var positionLastDash = uri.lastIndexOf('-');
			var firstPart = uri.substr(0, positionLastDash);
			var lastPart = uri.substr(positionLastDash + 1);

			if (lastPart.match(/^\d+$/)) {
				lastPart = parseInt(lastPart);
				lastPart++;

				uri = firstPart + '-' + lastPart;
			} else if (lastPart === '') {
				uri = uri + '1';
			} else {
				uri = uri = '-1';
			}
		}

		return uri;
	};

}]);

app.service('ColorUtilityService', function() {
	'use strict';

	var self = this;

	/**
	 * List of default colors
	 * @type {string[]}
	 */
	this.colors = [];

	/**
	 * generate an appropriate text color based on background color
	 * @param red
	 * @param green
	 * @param blue
	 * @returns {string}
	 */
	this.generateTextColorFromRGB = function(red, green, blue) {
		var brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000);
		return (brightness > 130) ? '#000000' : '#FAFAFA';
	};

	/**
	 * extract decimal values from hex rgb string
	 * @param colorString
	 * @returns {*}
	 */
	this.extractRGBFromHexString = function(colorString) {
		var fallbackColor = {
			r: 255,
			g: 255,
			b: 255
		}, matchedString;

		switch (colorString.length) {
			case 4:
				matchedString = colorString.match(/^#([0-9a-f]{3})$/i)[1];
				return (matchedString) ? {
					r: parseInt(matchedString.charAt(0), 16) * 0x11,
					g: parseInt(matchedString.charAt(1), 16) * 0x11,
					b: parseInt(matchedString.charAt(2), 16) * 0x11
				} : fallbackColor;

			case 7:
			case 9:
				var regex = new RegExp('^#([0-9a-f]{' + (colorString.length - 1) + '})$', 'i');
				matchedString = colorString.match(regex)[1];
				return (matchedString) ? {
					r: parseInt(matchedString.substr(0, 2), 16),
					g: parseInt(matchedString.substr(2, 2), 16),
					b: parseInt(matchedString.substr(4, 2), 16)
				} : fallbackColor;

			default:
				return fallbackColor;
		}
	};

	/**
	 * Make sure string for Hex always uses two digits
	 * @param str
	 * @returns {string}
	 * @private
	 */
	this._ensureTwoDigits = function(str) {
		return str.length === 1 ? '0' + str : str;
	};

	/**
	 * convert three Numbers to rgb hex string
	 * @param r
	 * @param g
	 * @param b
	 * @returns {string}
	 */
	this.rgbToHex = function(r, g, b) {
		if(Array.isArray(r)) {
			g = r[1];
			b = r[2];
			r = r[0];
		}

		return '#' + this._ensureTwoDigits(parseInt(r, 10).toString(16)) +
			this._ensureTwoDigits(parseInt(g, 10).toString(16)) +
			this._ensureTwoDigits(parseInt(b, 10).toString(16));
	};

	/**
	 * generates a random color
	 * @returns {string}
	 */
	this.randomColor = function() {
		if (typeof String.prototype.toHsl === 'function') {
			var hsl = Math.random().toString().toHsl();
			return self.rgbToHex(hslToRgb(hsl[0], hsl[1], hsl[2]));
		} else {
			return self.colors[Math.floor(Math.random() * self.colors.length)];
		}
	};

	// initialize default colors
	if (typeof String.prototype.toHsl === 'function') {
		//0 40 80 120 160 200 240 280 320
		var hashValues = ['15', '9', '4', 'b', '6', '11', '74', 'f', '57'];
		angular.forEach(hashValues, function(hashValue) {
			var hsl = hashValue.toHsl();
			var hslColor = hslToRgb(hsl[0], hsl[1], hsl[2]);
			self.colors.push(self.rgbToHex(hslColor));
		});
	} else {
		this.colors = [
			'#31CC7C',
			'#317CCC',
			'#FF7A66',
			'#F1DB50',
			'#7C31CC',
			'#CC317C',
			'#3A3B3D',
			'#CACBCD'
		];
	}
});

app.service('DavClient', function() {
	'use strict';

	var client = new dav.Client({
		baseUrl: OC.linkToRemote('dav/calendars'),
		xmlNamespaces: {
			'DAV:': 'd',
			'urn:ietf:params:xml:ns:caldav': 'c',
			'http://apple.com/ns/ical/': 'aapl',
			'http://owncloud.org/ns': 'oc',
			'http://calendarserver.org/ns/': 'cs'
		}
	});

	angular.extend(client, {
		NS_DAV: 'DAV:',
		NS_IETF: 'urn:ietf:params:xml:ns:caldav',
		NS_APPLE: 'http://apple.com/ns/ical/',
		NS_OWNCLOUD: 'http://owncloud.org/ns',
		NS_CALENDARSERVER: 'http://calendarserver.org/ns/',

		buildUrl: function(path) {
			return window.location.protocol + '//' + window.location.host + path;
		},
		wasRequestSuccessful: function(status) {
			return (status >= 200 && status <= 299);
		}
	});

	return client;
});
app.service('EventsEditorDialogService', ["$uibModal", function($uibModal) {
	'use strict';

		var EDITOR_POPOVER = 'eventspopovereditor.html';
		var EDITOR_SIDEBAR = 'eventssidebareditor.html';
		var REPEAT_QUESTION = ''; //TODO in followup PR

		var self = this;

		self.calendar = null;
		self.eventModal = null;
		self.fcEvent = null;
		self.promise = null;
		self.scope = null;
		self.simpleEvent = null;
		self.unlockCallback = null;

		function cleanup() {
			self.calendar = null;
			self.eventModal = null;
			self.fcEvent = null;
			self.promise = null;
			self.scope = null;
			self.simpleEvent = null;
		}

		function openDialog (template, position, rejectDialog, resolveDialog) {
			self.eventModal = $uibModal.open({
				templateUrl: template,
				controller: 'EditorController',
				windowClass: (template === EDITOR_POPOVER) ? 'popover' : null,
				appendTo: (template === EDITOR_POPOVER) ?
					angular.element('#popover-container') :
					angular.element('#app-content'),
				resolve: {
					vevent: function() {
						return self.fcEvent.vevent;
					},
					simpleEvent: function() {
						return self.simpleEvent;
					},
					calendar: function() {
						return self.calendar;
					},
					isNew: function() {
						return (self.fcEvent.vevent.etag === null);
					},
					emailAddress: function() {
						return angular.element('#fullcalendar').attr('data-emailAddress');
					}
				},
				scope: self.scope
			});

			if (template === EDITOR_SIDEBAR) {
				angular.element('#app-content').addClass('with-app-sidebar');
			}

			self.eventModal.rendered.then(function(result) {
				angular.element('#popover-container').css('display', 'none');
				angular.forEach(position, function(v) {
					angular.element('.modal').css(v.name, v.value);
				});
				angular.element('#popover-container').css('display', 'block');
			});

			self.eventModal.result.then(function(result) {
				if (result.action === 'proceed') {
					self.calendar = result.calendar;
					openDialog(EDITOR_SIDEBAR, null, rejectDialog, resolveDialog);
				} else {
					if (template === EDITOR_SIDEBAR) {
						angular.element('#app-content').removeClass('with-app-sidebar');
					}

					self.unlockCallback();
					resolveDialog({
						calendar: result.calendar,
						vevent: result.vevent
					});
					cleanup();
				}
			}).catch(function(reason) {
				if (template === EDITOR_SIDEBAR) {
					angular.element('#app-content').removeClass('with-app-sidebar');
				}

				if (reason !== 'superseded') {
					self.unlockCallback();
					cleanup();
				}

				rejectDialog(reason);
			});
		}

		function openRepeatQuestion() {
			//TODO in followup PR
		}

		this.open = function(scope, fcEvent, positionCallback, lockCallback, unlockCallback) {
			//don't reload editor for the same event
			if (self.fcEvent === fcEvent) {
				return self.promise;
			}

			//is an editor already open?
			if (self.fcEvent) {
				self.eventModal.dismiss('superseded');
			}

			cleanup();
			self.promise = new Promise(function(resolve, reject) {
				self.fcEvent = fcEvent;
				self.simpleEvent = fcEvent.getSimpleEvent();
				if (fcEvent.vevent) {
					self.calendar = fcEvent.vevent.calendar;
				}
				self.scope = scope;

				//calculate position of popover
				var position = positionCallback();

				//lock new fcEvent and unlock old fcEvent
				lockCallback();
				if (self.unlockCallback) {
					self.unlockCallback();
				}
				self.unlockCallback = unlockCallback;

				//skip popover on small devices
				if (angular.element(window).width() > 768) {
					openDialog(EDITOR_POPOVER, position, reject, resolve);
				} else {
					openDialog(EDITOR_SIDEBAR, null, reject, resolve);
				}
			});

			return self.promise;
	};

	return this;
}]);
app.service('ICalFactory', [
	function() {
		'use strict';

		// creates a new ICAL root element with a product id property
		return {
			new: function() {
				var root = new ICAL.Component(['vcalendar', [], []]);

				var version = angular.element('#fullcalendar').attr('data-appVersion');
				root.updatePropertyWithValue('prodid', '-//ownCloud calendar v' + version);

				return root;
			}
		};
	}
]);
app.factory('is', function () {
	'use strict';

	return {
		loading: false
	};
});

app.factory('RandomStringService', function () {
	'use strict';

	return {
		generate: function() {
			return Math.random().toString(36).substr(2);
		}
	};
});
app.service('SettingsService', ['$rootScope', '$http', function($rootScope, $http) {
	'use strict';

	this.getView = function() {
		return $http({
			method: 'GET',
			url: $rootScope.baseUrl + 'view'
		}).then(function(response) {
			return (response.status >= 200 && response.status <= 299) ? response.data.value : null;
		});
	};

	this.setView = function(view) {
		return $http({
			method: 'POST',
			url: $rootScope.baseUrl + 'view',
			data: {
				view: view
			}
		}).then(function(response) {
			return response.status >= 200 && response.status <= 299;
		});
	};

}]);
app.service('SplitterService', ['ICalFactory', 'SplittedICal',
	function(ICalFactory, SplittedICal) {
		'use strict';

		// provides function to split big ics blobs into an array of little ics blobs
		return {
			split: function(iCalString) {
				var timezones = [];
				var allObjects = {};

				var jcal = ICAL.parse(iCalString);
				var components = new ICAL.Component(jcal);

				var vtimezones = components.getAllSubcomponents('vtimezone');
				angular.forEach(vtimezones, function (vtimezone) {
					timezones.push(vtimezone);
				});

				var componentNames = ['vevent', 'vjournal', 'vtodo'];
				angular.forEach(componentNames, function (componentName) {
					var vobjects = components.getAllSubcomponents(componentName);
					allObjects[componentName] = {};

					angular.forEach(vobjects, function (vobject) {
						var uid = vobject.getFirstPropertyValue('uid');
						allObjects[componentName][uid] = allObjects[componentName][uid] || [];
						allObjects[componentName][uid].push(vobject);
					});
				});

				var	name = components.getFirstPropertyValue('x-wr-calname');
				var color =  components.getFirstPropertyValue('x-apple-calendar-color');

				var split = SplittedICal(name, color);
				angular.forEach(componentNames, function (componentName) {
					angular.forEach(allObjects[componentName], function (objects) {
						var component = ICalFactory.new();
						angular.forEach(timezones, function (timezone) {
							component.addSubcomponent(timezone);
						});
						angular.forEach(objects, function (object) {
							component.addSubcomponent(object);
						});
						split.addObject(componentName, component.toString());
					});
				});

				return split;
			}
		};
	}
]);
app.service('TimezoneListProvider',
	function () {
		'use strict';
		return new Promise(function (resolve) {
			resolve([
				'Africa\/Abidjan',
				'Africa\/Accra',
				'Africa\/Addis_Ababa',
				'Africa\/Algiers',
				'Africa\/Asmara',
				'Africa\/Asmera',
				'Africa\/Bamako',
				'Africa\/Bangui',
				'Africa\/Banjul',
				'Africa\/Bissau',
				'Africa\/Blantyre',
				'Africa\/Brazzaville',
				'Africa\/Bujumbura',
				'Africa\/Cairo',
				'Africa\/Casablanca',
				'Africa\/Ceuta',
				'Africa\/Conakry',
				'Africa\/Dakar',
				'Africa\/Dar_es_Salaam',
				'Africa\/Djibouti',
				'Africa\/Douala',
				'Africa\/El_Aaiun',
				'Africa\/Freetown',
				'Africa\/Gaborone',
				'Africa\/Harare',
				'Africa\/Johannesburg',
				'Africa\/Juba',
				'Africa\/Kampala',
				'Africa\/Khartoum',
				'Africa\/Kigali',
				'Africa\/Kinshasa',
				'Africa\/Lagos',
				'Africa\/Libreville',
				'Africa\/Lome',
				'Africa\/Luanda',
				'Africa\/Lubumbashi',
				'Africa\/Lusaka',
				'Africa\/Malabo',
				'Africa\/Maputo',
				'Africa\/Maseru',
				'Africa\/Mbabane',
				'Africa\/Mogadishu',
				'Africa\/Monrovia',
				'Africa\/Nairobi',
				'Africa\/Ndjamena',
				'Africa\/Niamey',
				'Africa\/Nouakchott',
				'Africa\/Ouagadougou',
				'Africa\/Porto-Novo',
				'Africa\/Sao_Tome',
				'Africa\/Timbuktu',
				'Africa\/Tripoli',
				'Africa\/Tunis',
				'Africa\/Windhoek',
				'America\/Adak',
				'America\/Anchorage',
				'America\/Anguilla',
				'America\/Antigua',
				'America\/Araguaina',
				'America\/Argentina\/Buenos_Aires',
				'America\/Argentina\/Catamarca',
				'America\/Argentina\/ComodRivadavia',
				'America\/Argentina\/Cordoba',
				'America\/Argentina\/Jujuy',
				'America\/Argentina\/La_Rioja',
				'America\/Argentina\/Mendoza',
				'America\/Argentina\/Rio_Gallegos',
				'America\/Argentina\/Salta',
				'America\/Argentina\/San_Juan',
				'America\/Argentina\/San_Luis',
				'America\/Argentina\/Tucuman',
				'America\/Argentina\/Ushuaia',
				'America\/Aruba',
				'America\/Asuncion',
				'America\/Atikokan',
				'America\/Bahia',
				'America\/Bahia_Banderas',
				'America\/Barbados',
				'America\/Belem',
				'America\/Belize',
				'America\/Blanc-Sablon',
				'America\/Boa_Vista',
				'America\/Bogota',
				'America\/Boise',
				'America\/Cambridge_Bay',
				'America\/Campo_Grande',
				'America\/Cancun',
				'America\/Caracas',
				'America\/Cayenne',
				'America\/Cayman',
				'America\/Chicago',
				'America\/Chihuahua',
				'America\/Costa_Rica',
				'America\/Creston',
				'America\/Cuiaba',
				'America\/Curacao',
				'America\/Danmarkshavn',
				'America\/Dawson',
				'America\/Dawson_Creek',
				'America\/Denver',
				'America\/Detroit',
				'America\/Dominica',
				'America\/Edmonton',
				'America\/Eirunepe',
				'America\/El_Salvador',
				'America\/Fortaleza',
				'America\/Glace_Bay',
				'America\/Godthab',
				'America\/Goose_Bay',
				'America\/Grand_Turk',
				'America\/Grenada',
				'America\/Guadeloupe',
				'America\/Guatemala',
				'America\/Guayaquil',
				'America\/Guyana',
				'America\/Halifax',
				'America\/Havana',
				'America\/Hermosillo',
				'America\/Indiana\/Indianapolis',
				'America\/Indiana\/Knox',
				'America\/Indiana\/Marengo',
				'America\/Indiana\/Petersburg',
				'America\/Indiana\/Tell_City',
				'America\/Indiana\/Vevay',
				'America\/Indiana\/Vincennes',
				'America\/Indiana\/Winamac',
				'America\/Inuvik',
				'America\/Iqaluit',
				'America\/Jamaica',
				'America\/Juneau',
				'America\/Kentucky\/Louisville',
				'America\/Kentucky\/Monticello',
				'America\/Kralendijk',
				'America\/La_Paz',
				'America\/Lima',
				'America\/Los_Angeles',
				'America\/Louisville',
				'America\/Lower_Princes',
				'America\/Maceio',
				'America\/Managua',
				'America\/Manaus',
				'America\/Marigot',
				'America\/Martinique',
				'America\/Matamoros',
				'America\/Mazatlan',
				'America\/Menominee',
				'America\/Merida',
				'America\/Metlakatla',
				'America\/Mexico_City',
				'America\/Miquelon',
				'America\/Moncton',
				'America\/Monterrey',
				'America\/Montevideo',
				'America\/Montreal',
				'America\/Montserrat',
				'America\/Nassau',
				'America\/New_York',
				'America\/Nipigon',
				'America\/Nome',
				'America\/Noronha',
				'America\/North_Dakota\/Beulah',
				'America\/North_Dakota\/Center',
				'America\/North_Dakota\/New_Salem',
				'America\/Ojinaga',
				'America\/Panama',
				'America\/Pangnirtung',
				'America\/Paramaribo',
				'America\/Phoenix',
				'America\/Port-au-Prince',
				'America\/Port_of_Spain',
				'America\/Porto_Velho',
				'America\/Puerto_Rico',
				'America\/Rainy_River',
				'America\/Rankin_Inlet',
				'America\/Recife',
				'America\/Regina',
				'America\/Resolute',
				'America\/Rio_Branco',
				'America\/Santa_Isabel',
				'America\/Santarem',
				'America\/Santiago',
				'America\/Santo_Domingo',
				'America\/Sao_Paulo',
				'America\/Scoresbysund',
				'America\/Shiprock',
				'America\/Sitka',
				'America\/St_Barthelemy',
				'America\/St_Johns',
				'America\/St_Kitts',
				'America\/St_Lucia',
				'America\/St_Thomas',
				'America\/St_Vincent',
				'America\/Swift_Current',
				'America\/Tegucigalpa',
				'America\/Thule',
				'America\/Thunder_Bay',
				'America\/Tijuana',
				'America\/Toronto',
				'America\/Tortola',
				'America\/Vancouver',
				'America\/Whitehorse',
				'America\/Winnipeg',
				'America\/Yakutat',
				'America\/Yellowknife',
				'Antarctica\/Casey',
				'Antarctica\/Davis',
				'Antarctica\/DumontDUrville',
				'Antarctica\/Macquarie',
				'Antarctica\/Mawson',
				'Antarctica\/McMurdo',
				'Antarctica\/Palmer',
				'Antarctica\/Rothera',
				'Antarctica\/South_Pole',
				'Antarctica\/Syowa',
				'Antarctica\/Vostok',
				'Arctic\/Longyearbyen',
				'Asia\/Aden',
				'Asia\/Almaty',
				'Asia\/Amman',
				'Asia\/Anadyr',
				'Asia\/Aqtau',
				'Asia\/Aqtobe',
				'Asia\/Ashgabat',
				'Asia\/Baghdad',
				'Asia\/Bahrain',
				'Asia\/Baku',
				'Asia\/Bangkok',
				'Asia\/Beirut',
				'Asia\/Bishkek',
				'Asia\/Brunei',
				'Asia\/Calcutta',
				'Asia\/Choibalsan',
				'Asia\/Chongqing',
				'Asia\/Colombo',
				'Asia\/Damascus',
				'Asia\/Dhaka',
				'Asia\/Dili',
				'Asia\/Dubai',
				'Asia\/Dushanbe',
				'Asia\/Gaza',
				'Asia\/Harbin',
				'Asia\/Hebron',
				'Asia\/Ho_Chi_Minh',
				'Asia\/Hong_Kong',
				'Asia\/Hovd',
				'Asia\/Irkutsk',
				'Asia\/Istanbul',
				'Asia\/Jakarta',
				'Asia\/Jayapura',
				'Asia\/Jerusalem',
				'Asia\/Kabul',
				'Asia\/Kamchatka',
				'Asia\/Karachi',
				'Asia\/Kashgar',
				'Asia\/Kathmandu',
				'Asia\/Katmandu',
				'Asia\/Khandyga',
				'Asia\/Kolkata',
				'Asia\/Krasnoyarsk',
				'Asia\/Kuala_Lumpur',
				'Asia\/Kuching',
				'Asia\/Kuwait',
				'Asia\/Macau',
				'Asia\/Magadan',
				'Asia\/Makassar',
				'Asia\/Manila',
				'Asia\/Muscat',
				'Asia\/Nicosia',
				'Asia\/Novokuznetsk',
				'Asia\/Novosibirsk',
				'Asia\/Omsk',
				'Asia\/Oral',
				'Asia\/Phnom_Penh',
				'Asia\/Pontianak',
				'Asia\/Pyongyang',
				'Asia\/Qatar',
				'Asia\/Qyzylorda',
				'Asia\/Rangoon',
				'Asia\/Riyadh',
				'Asia\/Saigon',
				'Asia\/Sakhalin',
				'Asia\/Samarkand',
				'Asia\/Seoul',
				'Asia\/Shanghai',
				'Asia\/Singapore',
				'Asia\/Taipei',
				'Asia\/Tashkent',
				'Asia\/Tbilisi',
				'Asia\/Tehran',
				'Asia\/Thimphu',
				'Asia\/Tokyo',
				'Asia\/Ulaanbaatar',
				'Asia\/Urumqi',
				'Asia\/Ust-Nera',
				'Asia\/Vientiane',
				'Asia\/Vladivostok',
				'Asia\/Yakutsk',
				'Asia\/Yekaterinburg',
				'Asia\/Yerevan',
				'Atlantic\/Azores',
				'Atlantic\/Bermuda',
				'Atlantic\/Canary',
				'Atlantic\/Cape_Verde',
				'Atlantic\/Faeroe',
				'Atlantic\/Faroe',
				'Atlantic\/Jan_Mayen',
				'Atlantic\/Madeira',
				'Atlantic\/Reykjavik',
				'Atlantic\/South_Georgia',
				'Atlantic\/St_Helena',
				'Atlantic\/Stanley',
				'Australia\/Adelaide',
				'Australia\/Brisbane',
				'Australia\/Broken_Hill',
				'Australia\/Currie',
				'Australia\/Darwin',
				'Australia\/Eucla',
				'Australia\/Hobart',
				'Australia\/Lindeman',
				'Australia\/Lord_Howe',
				'Australia\/Melbourne',
				'Australia\/Perth',
				'Australia\/Sydney',
				'Europe\/Amsterdam',
				'Europe\/Andorra',
				'Europe\/Athens',
				'Europe\/Belfast',
				'Europe\/Belgrade',
				'Europe\/Berlin',
				'Europe\/Bratislava',
				'Europe\/Brussels',
				'Europe\/Bucharest',
				'Europe\/Budapest',
				'Europe\/Busingen',
				'Europe\/Chisinau',
				'Europe\/Copenhagen',
				'Europe\/Dublin',
				'Europe\/Gibraltar',
				'Europe\/Guernsey',
				'Europe\/Helsinki',
				'Europe\/Isle_of_Man',
				'Europe\/Istanbul',
				'Europe\/Jersey',
				'Europe\/Kaliningrad',
				'Europe\/Kiev',
				'Europe\/Lisbon',
				'Europe\/Ljubljana',
				'Europe\/London',
				'Europe\/Luxembourg',
				'Europe\/Madrid',
				'Europe\/Malta',
				'Europe\/Mariehamn',
				'Europe\/Minsk',
				'Europe\/Monaco',
				'Europe\/Moscow',
				'Europe\/Nicosia',
				'Europe\/Oslo',
				'Europe\/Paris',
				'Europe\/Podgorica',
				'Europe\/Prague',
				'Europe\/Riga',
				'Europe\/Rome',
				'Europe\/Samara',
				'Europe\/San_Marino',
				'Europe\/Sarajevo',
				'Europe\/Simferopol',
				'Europe\/Skopje',
				'Europe\/Sofia',
				'Europe\/Stockholm',
				'Europe\/Tallinn',
				'Europe\/Tirane',
				'Europe\/Uzhgorod',
				'Europe\/Vaduz',
				'Europe\/Vatican',
				'Europe\/Vienna',
				'Europe\/Vilnius',
				'Europe\/Volgograd',
				'Europe\/Warsaw',
				'Europe\/Zagreb',
				'Europe\/Zaporozhye',
				'Europe\/Zurich',
				'Indian\/Antananarivo',
				'Indian\/Chagos',
				'Indian\/Christmas',
				'Indian\/Cocos',
				'Indian\/Comoro',
				'Indian\/Kerguelen',
				'Indian\/Mahe',
				'Indian\/Maldives',
				'Indian\/Mauritius',
				'Indian\/Mayotte',
				'Indian\/Reunion',
				'Pacific\/Apia',
				'Pacific\/Auckland',
				'Pacific\/Chatham',
				'Pacific\/Chuuk',
				'Pacific\/Easter',
				'Pacific\/Efate',
				'Pacific\/Enderbury',
				'Pacific\/Fakaofo',
				'Pacific\/Fiji',
				'Pacific\/Funafuti',
				'Pacific\/Galapagos',
				'Pacific\/Gambier',
				'Pacific\/Guadalcanal',
				'Pacific\/Guam',
				'Pacific\/Honolulu',
				'Pacific\/Johnston',
				'Pacific\/Kiritimati',
				'Pacific\/Kosrae',
				'Pacific\/Kwajalein',
				'Pacific\/Majuro',
				'Pacific\/Marquesas',
				'Pacific\/Midway',
				'Pacific\/Nauru',
				'Pacific\/Niue',
				'Pacific\/Norfolk',
				'Pacific\/Noumea',
				'Pacific\/Pago_Pago',
				'Pacific\/Palau',
				'Pacific\/Pitcairn',
				'Pacific\/Pohnpei',
				'Pacific\/Ponape',
				'Pacific\/Port_Moresby',
				'Pacific\/Rarotonga',
				'Pacific\/Saipan',
				'Pacific\/Tahiti',
				'Pacific\/Tarawa',
				'Pacific\/Tongatapu',
				'Pacific\/Truk',
				'Pacific\/Wake',
				'Pacific\/Wallis',
				'Pacific\/Yap',
				'UTC',
				'GMT',
				'Z'
			]);
		});
	}
);

app.service('TimezoneService', ['$rootScope', '$http', 'Timezone', 'TimezoneListProvider',
	function ($rootScope, $http, Timezone, TimezoneListProvider) {
		'use strict';

		var _this = this;
		this._timezones = {};

		this._timezones.UTC = new Timezone(ICAL.TimezoneService.get('UTC'));
		this._timezones.GMT = this._timezones.UTC;
		this._timezones.Z = this._timezones.UTC;

		this.listAll = function () {
			return TimezoneListProvider;
		};

		this.get = function (tzid) {
			tzid = tzid.toUpperCase();


			if (_this._timezones[tzid]) {
				return new Promise(function (resolve) {
					resolve(_this._timezones[tzid]);
				});
			}

			_this._timezones[tzid] = $http({
				method: 'GET',
				url: $rootScope.baseUrl + 'timezones/' + tzid + '.ics'
			}).then(function (response) {
				if (response.status >= 200 && response.status <= 299) {
					var timezone = new Timezone(response.data);
					_this._timezones[tzid] = timezone;

					return timezone;
				}
			});

			return _this._timezones[tzid];
		};

		this.getCurrent = function () {
			return this.get(this.current());
		};

		this.current = function () {
			var tz = jstz.determine();
			var tzname = tz ? tz.name() : 'UTC';

			switch(tzname) {
				case 'Etc/UTC':
					tzname = 'UTC';
					break;

				default:
					break;
			}

			return tzname;
		};
	}
]);

app.service('VEventService', ['DavClient', 'VEvent', 'RandomStringService', function(DavClient, VEvent, RandomStringService) {
	'use strict';

	var _this = this;

	this._xmls = new XMLSerializer();

	this.getAll = function(calendar, start, end) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var cCalQuery = xmlDoc.createElement('c:calendar-query');
		cCalQuery.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cCalQuery.setAttribute('xmlns:d', 'DAV:');
		cCalQuery.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cCalQuery.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cCalQuery);

		var dProp = xmlDoc.createElement('d:prop');
		cCalQuery.appendChild(dProp);

		var dGetEtag = xmlDoc.createElement('d:getetag');
		dProp.appendChild(dGetEtag);

		var cCalendarData = xmlDoc.createElement('c:calendar-data');
		dProp.appendChild(cCalendarData);

		var cFilter = xmlDoc.createElement('c:filter');
		cCalQuery.appendChild(cFilter);

		var cCompFilterVCal = xmlDoc.createElement('c:comp-filter');
		cCompFilterVCal.setAttribute('name', 'VCALENDAR');
		cFilter.appendChild(cCompFilterVCal);

		var cCompFilterVEvent = xmlDoc.createElement('c:comp-filter');
		cCompFilterVEvent.setAttribute('name', 'VEVENT');
		cCompFilterVCal.appendChild(cCompFilterVEvent);

		var cTimeRange = xmlDoc.createElement('c:time-range');
		cTimeRange.setAttribute('start', this._getTimeRangeStamp(start));
		cTimeRange.setAttribute('end', this._getTimeRangeStamp(end));
		cCompFilterVEvent.appendChild(cTimeRange);

		var url = calendar.url;
		var headers = {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': OC.requestToken
		};
		var body = this._xmls.serializeToString(cCalQuery);

		return DavClient.request('REPORT', url, headers, body).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//TODO - something went wrong
				return;
			}

			var vevents = [];

			for (var i in response.body) {
				var object = response.body[i];
				var properties = object.propStat[0].properties;

				var data = properties['{urn:ietf:params:xml:ns:caldav}calendar-data'];
				var etag = properties['{DAV:}getetag'];
				var uri = object.href.substr(object.href.lastIndexOf('/') + 1);

				var vevent;
				//try {
					vevent = new VEvent(calendar, data, etag, uri);
				//} catch(e) {
				//	console.log(e);
				//	continue;
				//}
				vevents.push(vevent);
			}

			return vevents;
		});
	};

	this.get = function(calendar, uri) {
		var url = calendar.url + uri;
		return DavClient.request('GET', url, {'requesttoken' : OC.requestToken}, '').then(function(response) {
			return new VEvent(calendar, response.body, response.xhr.getResponseHeader('ETag'), uri);
		});
	};

	this.create = function(calendar, data, returnEvent) {
		if (typeof returnEvent === 'undefined') {
			returnEvent = true;
		}

		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': OC.requestToken
		};
		var uri = this._generateRandomUri();
		var url = calendar.url + uri;

		return DavClient.request('PUT', url, headers, data).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return false;
				// TODO - something went wrong, do smth about it
			}

			return returnEvent ?
				_this.get(calendar, uri) :
				true;
		});
	};

	this.update = function(event) {
		var url = event.calendar.url + event.uri;
		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('PUT', url, headers, event.data).then(function(response) {
			event.etag = response.xhr.getResponseHeader('ETag');
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this.delete = function(event) {
		var url = event.calendar.url + event.uri;
		var headers = {
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('DELETE', url, headers, '').then(function(response) {
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this._generateRandomUri = function() {
		var uri = 'ownCloud-';
		uri += RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		return uri;
	};

	this._getTimeRangeStamp = function(momentObject) {
		return momentObject.format('YYYYMMDD') + 'T' + momentObject.format('HHmmss') + 'Z';
	};

}]);

