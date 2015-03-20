
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

		$scope.uiConfig = {
			calendar: {
				height: $(window).height() - $('#controls').height() - $('#header').height(),
				editable: true,
				selectable: true,
				selectHelper: true,
				eventSources: initEventSources,
				timezone: $scope.defaulttimezone,
				defaultView: $scope.defaultView,
				header: {
					left: '',
					center: '',
					right: ''
				},
				firstDay: angular.element('#firstday').attr('data-firstday'),
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

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$window',
	'$routeParams', 'Restangular', 'CalendarModel', 'EventsModel', 'is',
	function ($scope, $window, $routeParams, Restangular,
			  CalendarModel, EventsModel, is) {

		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		$scope.currentload = null;

		// Default values for new calendars
		$scope.newcolor = 'rgba(37,46,95,1.0)';
		$scope.newCalendarInputVal = '';

		// Needed for CalDAV Input opening.
		$scope.calDAVmodel = '';
		$scope.i = [];

		// Needed for editing calendars.
		$scope.editmodel = '';
		$scope.editfieldset = null;
		$scope.editcolor = '';
		$scope.vevent = true;
		$scope.vjournal = false;
		$scope.vtodo = false;

		// Needed for Sharing Calendars
		$scope.sharemodel = '';
		$scope.sharefieldset = null;

		// Create a New Calendar
		$scope.create = function () {
			var newCalendar = {
				displayname: $scope.newCalendarInputVal,
				color: $scope.newcolor,
				components: {
					vevent: true,
					vjournal: true,
					vtodo: true
				},
				enabled: true
			};

			calendarResource.post(newCalendar).then(function (newCalendarObj) {
				CalendarModel.create(newCalendarObj);
				$scope.calendars = CalendarModel.getAll();
			});
		};

		// Download button
		$scope.download = function (id) {
			$window.open('v1/calendars/' + id + '/export');
		};

		// Sharing Logic Comes Here.
		$scope.share = function ($index, id) {
			if ($scope.sharefieldset === id) {
				$scope.sharefieldset = null;
			} else {
				$scope.sharefieldset = id;
			}
		};

		// Share AutoComplete Typeahead
		$scope.getSharePeople = function(val) {
			/*return Restangular.oneUrl(OC.filePath('core', 'ajax', 'share.php')).getList('sharepeople',
				{'sharepeople': $scope.sharemodel}).then(function(res){
					var people =[];
					angular.forEach(res, function (item) {
						people.push(item.label);
					});
				return people;
			});
			*/
		};

		// CalDAV display - hide logic goes here.
		$scope.toggleCalDAV = function ($index, uri) {
			$scope.i.push($index);
			$scope.calDAVmodel = OC.linkToRemote('caldav') + '/' +
				escapeHTML(encodeURIComponent(oc_current_user)) + '/' +
				escapeHTML(encodeURIComponent(uri));
		};

		// Update calendar button
		$scope.updatecalendarform = function ($index, id, displayname, color) {
			if ($scope.editfieldset === id) {
				$scope.editfieldset = null;
			} else {
				$scope.editfieldset = id;
			}

			$scope.editmodel = displayname;
			$scope.editcolor = color;

			$scope.update = function (id, updatedName, updatedColor, vevent,
									  vjournal, vtodo) {
				var updated = {
					displayname: updatedName,
					color: updatedColor,
					components: {
						vevent: vevent,
						vjournal: vjournal,
						vtodo: vtodo
					}
				};

				Restangular.one('calendars', id).patch(updated).then(
					function (updated) {
					CalendarModel.update(updated);
					$scope.calendars = CalendarModel.getAll();
					$scope.editfieldset = null;
				});
			};
		};

		// Delete a Calendar
		$scope.remove = function (id) {
			var calendar = CalendarModel.get(id);
			calendar.remove().then(function () {
				CalendarModel.remove(id);
				$scope.calendars = CalendarModel.getAll();
			});
		};

		// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function (newid) {
			$scope.addEvent(newid); // Switches watch in CalController
		};

		$scope.triggerCalendarEnable = function(id) {
			$scope.currentload = true;
			is.loading = true;
			var calendar = CalendarModel.get(id);
			var newEnabled = !calendar.enabled;
			calendar.patch({'enabled': newEnabled}).then(
				function (calendarObj) {
				CalendarModel.update(calendarObj);
				$scope.calendars = CalendarModel.getAll();
				is.loading = false;
				$scope.currentload = false;
			});
		};
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

		$scope.alltimeunitsSelect = [
			{ displayname: t('Calendar', 'min'), type: 'min'},
			{ displayname: t('Calendar', 'sec'), type: 'sec'},
			{ displayname: t('Calendar', 'hours'), type: 'hours'},
			{ displayname: t('Calendar', 'days'), type: 'days'},
			{ displayname: t('Calendar', 'weeks'), type: 'weeks'}
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
		$scope.timeunitreminder = $scope.alltimeunitsSelect[0];
		$scope.timepositionreminder = $scope.timepositionreminderSelect[0];
		$scope.startendrelativereminder = $scope.startendreminderSelect[0];
		
		$scope.update = function () {
			EventsModel.updateevent($scope.properties);
		};

		$scope.deletereminderbutton = function () {
			// TODO : Implement logic on deleting reminders once we have structure ready.
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

		$scope.pushcalendar = function (id) {
			Restangular.one('calendars', id).withHttpConfig({transformRequest: angular.identity}).customPOST(
				$scope.filescontent,
				'import',
				undefined,
				{
					'Content-Type': 'text/calendar'
				}
			).then( function () {

			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		$scope.calendars = CalendarModel.getAll();

		//to send a patch to add a hidden event again
		$scope.enableCalendar = function (id) {
			Restangular.one('calendars', id).patch({ 'components' : {'vevent' : true }});
		};


		if ($scope.hiddencalendar === undefined) {
			angular.element('#hiddencalendar').parent().addClass('hide');
		}
	}
]);

/**
* Controller: SubscriptionController
* Description: Takes care of Subscription List in the App Navigation.
*/

app.controller('SubscriptionController', ['$scope', '$window', 'SubscriptionModel', 'CalendarModel', 'EventsModel', 'Restangular', 'is',
	function ($scope, $window, SubscriptionModel, CalendarModel, EventsModel, Restangular, is) {

		$scope.subscriptions = SubscriptionModel.getAll();
		$scope.calendars = CalendarModel.getAll();

		$scope.calDAVfieldset = [];
		$scope.calDAVmodel = '';
		$scope.i = []; // Needed for only one CalDAV Input opening.

		var subscriptionResource = Restangular.all('subscriptions');

		subscriptionResource.getList().then(function (subscriptions) {
			SubscriptionModel.addAll(subscriptions);
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var backendResource = Restangular.all('backends');

		backendResource.getList().then(function (backendsobject) {
			$scope.subscriptiontypeSelect = SubscriptionModel.getsubscriptionnames(backendsobject);
			$scope.selectedsubscriptionbackendmodel = $scope.subscriptiontypeSelect[0]; // to remove the empty model.
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		$scope.newSubscriptionUrl = '';

		$scope.create = function (newSubscriptionInputVal) {
			var newSubscription = {
				"type": $scope.selectedsubscriptionbackendmodel.type,
				"url": $scope.newSubscriptionUrl,
			};
			subscriptionResource.post(newSubscription).then(function (newSubscription) {
				SubscriptionModel.create(newSubscription);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		// CalDAV display - hide logic goes here.
		$scope.toggleCalDAV = function ($index, uri, id) {
			$scope.i.push($index);
			$scope.calDAVmodel = OC.linkToRemote('caldav') + '/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/' + escapeHTML(encodeURIComponent(uri));
			for (var i = 0; i < $scope.i.length - 1; i++) {
				$scope.calDAVfieldset[i] = false;
			}

			$scope.calDAVfieldset[$index] = true;
			$scope.hidecalDAVfieldset = function ($index) {
				$scope.calDAVfieldset[$index] = false;
			};
		};

		$scope.download = function (id) {
			$window.open('v1/calendars/' + id + '/export');
		};

		// To Delete a Calendar
		$scope.delete = function (id) {
			var calendar = CalendarModel.get(id);
			var delcalendarResource = Restangular.one('calendars', id);
			delcalendarResource.remove().then(function () {
				CalendarModel.remove(calendar);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

				// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function (newid) {
			$scope.addEvent(newid); // Switches watch in CalController
		};

		$scope.triggerCalendarEnable = function(id) {
			$scope.currentload = true;
			is.loading = true;
			var calendar = CalendarModel.get(id);
			var newEnabled = !calendar.enabled;
			calendar.patch({'enabled': newEnabled}).then(
				function (calendarObj) {
				CalendarModel.update(calendarObj);
				$scope.calendars = CalendarModel.getAll();
				is.loading = false;
				$scope.currentload = false;
			});
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
// TODO: Remove this as this is not the best of the solutions.

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

	CalendarModel.prototype = {
		create: function (newCalendar) {
			this.calendars.push(newCalendar);
			this.calendarId[newCalendar.id] = newCalendar;
			this.created = newCalendar;
		},
		add: function (calendar) {
			this.updateIfExists(calendar);
		},
		addAll: function (calendars) {
			for (var i = 0; i < calendars.length; i++) {
				this.add(calendars[i]);
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
		updateIfExists: function (updated) {
			var calendar = this.calendarId[updated.id];
			if (angular.isDefined(calendar)) {
				calendar.displayname = updated.displayname;
				calendar.color = updated.color;
			} else {
				this.calendars.push(updated);
				this.calendarId[updated.id] = updated;
			}
		},
		update: function(calendar) {
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
				draggable: false,
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
					this.addeventobjectcontent(event,this.vevents[i]);
				}
			}
		},
		addeventobjectcontent: function (event,vevent) {
			this.eventobject.push({
				"calendar":event,
				"title" : vevent.getFirstPropertyValue('summary'),
				"location" : vevent.getFirstPropertyValue('location'),
				"categoties" : vevent.getFirstPropertyValue('category'),
				"description" : vevent.getFirstPropertyValue('description')
			});
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
		this.subscriptiondetails = [];
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
		getsubscriptionnames: function (backendobject) {
			for (var i = 0; i < backendobject.length; i++) {
				for (var j = 0; j < backendobject[i].subscriptions.length; j++) {
					this.subscriptiondetails = [
						{
							"name": backendobject[i].subscriptions[j].name,
							"type": backendobject[i].subscriptions[j].type
						}
					];
				}
			}
			return this.subscriptiondetails;
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
