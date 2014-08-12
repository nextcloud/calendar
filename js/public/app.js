
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
				// TODO : this can leave, as we are not really using routes right now.
				calendar: ['$route', '$q', 'Restangular',
					function ($route, $q, Restangular) {
						var deferred = $q.defer();
						var id = $route.current.params.id;
						Restangular.one('calendars', id).get().then(function (calendar) {
							deferred.resolve(calendar);
						}, function () {
							deferred.reject();
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

app.controller('CalController', ['$scope', '$modal', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel', 'ViewModel', 'TimezoneModel', 'DialogModel',
	function ($scope, $modal, Restangular, calendar, CalendarModel, EventsModel, ViewModel, TimezoneModel, DialogModel) {

		$scope.eventSources = EventsModel.getAll();
		$scope.defaultView = ViewModel.getAll();
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

		// Responds to change in View from calendarlistcontroller.
		viewResource.get().then(function (views) {
			ViewModel.add(views);
		});
		//$scope.defaultView = viewResource.get();

		$scope.eventSource = {};
		$scope.calendars = $scope.calendarModel.getAll();

		var initEventSources = [];
		angular.forEach($scope.calendars, function (value, key) {
			if ($scope.eventSource[value.id] === undefined) {
				$scope.eventSource[value.id] = {
					events: function (start, end, timezone, callback) {
						start = start.format('X');
						end = end.format('X');
						Restangular.one('calendars', value.id).one('events').one('inPeriod').getList(start + '/' + end).then(function (eventsobject) {
							callback(EventsModel.addAllDisplayFigures(value.id, eventsobject, start, end, $scope.timezone));
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
				columnFormat: {
					month: t('calendar', 'ddd'),
					week: t('calendar', 'ddd M/D'),
					day: t('calendar', 'dddd M/D')
				},
				titleFormat: {
					month: t('calendar', 'MMMM yyyy'),
					week: t('calendar', "MMM d[ yyyy]{ '–'[ MMM] d yyyy}"),
					day: t('calendar', 'dddd, MMM d, yyyy')
				},
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
					angular.element('#datecontrol_current').html($('<p>').html(view.title).text());
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

			$scope.eventSource[id].color = updatedCalendar.color;
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

		$scope.$watch('calendarModel.activator', function (newobj, oldobj) {
			if (newobj.id !== '') {
				if (newobj.bool === true) {
					$scope.calendar.fullCalendar('addEventSource', $scope.eventSource[newobj.id]);
				} else {
					$scope.calendar.fullCalendar('removeEventSource', $scope.eventSource[newobj.id]);
				}
			}
		}, true);

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

		$scope.$watch('calendarModel.datepickerview', function (newview, oldview) {
			$scope.changeview = function (newview, calendar) {
				calendar.fullCalendar(newview.view);
			};
			if (newview.view !== '' && $scope.calendar !== undefined) {
				$scope.changeview(newview, $scope.calendar);
			}
		}, true);

		$scope.$watch('calendarModel.date', function (newview, oldview) {
			$scope.gotodate = function (newview, calendar) {
				calendar.fullCalendar('gotoDate', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.gotodate(newview, $scope.calendar);
			}
		});

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

app.controller('CalendarListController', ['$scope', '$window', '$location',
	'$routeParams', 'Restangular', 'CalendarModel', 'EventsModel',
	function ($scope, $window, $location, $routeParams, Restangular,
			  CalendarModel, EventsModel) {

		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});

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
		$scope.share = function (shareWith) {

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
			var calendar = CalendarModel.get(id);
			var newEnabled = !calendar.enabled;

			calendar.patch({'enabled': newEnabled}).then(
				function (calendarObj) {
				CalendarModel.update(calendarObj);
				$scope.calendars = CalendarModel.getAll();
			});
		};
	}
]);

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

app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'DialogModel', 'Model',
	function ($scope, $routeParams, Restangular, CalendarModel, TimezoneModel, EventsModel, DialogModel, Model) {
		
		$scope.eventsmodel = EventsModel;

		$scope.$watch('eventsmodel.eventobject', function (newval, oldval) {
			if (newval.event !== '') {
				$scope.properties = {
					title : newval.title,
					location : newval.location,
					categories : newval.categories,
					description : newval.description,
					attendees : []
				};
			}
		});

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

		// TODO : This should duplicate the div for adding more than one attendee.
		$scope.addmoreattendees = function () {
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
		};

		$scope.update = function () {
			EventsModel.updateevent($scope.properties);
		};
	}
]);
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
			$scope.$digest(); // Shouldn't digest reset scope for it to be implemented again and again?
		});

		$scope.import = function (id) {
			Restangular.one('calendars', id).withHttpConfig({transformRequest: angular.identity}).customPOST(
				$scope.filescontent, // Replace this by the string to be posted.
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
		var calendarResource = Restangular.all('calendars');

		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		// Time Format Dropdown
		$scope.timeformatSelect = [
			{ time: t('calendar', '24h'), val: '24' },
			{ time: t('calendar', '12h'), val: 'ampm' }
		];

		for (var i=0; i<$scope.timeformatSelect.length; i++) {
			if (angular.element('#timeformat').attr('data-timeFormat') == $scope.timeformatSelect[i].val) {
				$scope.selectedtime = $scope.timeformatSelect[i];
			}
		}

		// First Day Dropdown
		$scope.firstdaySelect = [
			{ day: t('calendar', 'Monday'), val: 'mo' },
			{ day: t('calendar', 'Sunday'), val: 'su' },
			{ day: t('calendar', 'Saturday'), val: 'sa' }
		];

		for (var j=0; j<$scope.firstdaySelect.length; j++) {
			if (angular.element('#firstday').attr('data-firstDay') == $scope.firstdaySelect[j].val) {
				$scope.selectedday = $scope.firstdaySelect[j];
			}
		}

		//to send a patch to add a hidden event again
		$scope.enableCalendar = function (id) {
			Restangular.one('calendars', id).patch({ 'components' : {'vevent' : true }});
		};

		// Changing the first day
		$scope.changefirstday = function (firstday) {
			firstdayResource.post(firstday.val).then(function (response) {
				OC.Notification.show(t('calendar', response.message));
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
			CalendarModel.pushfirstday(firstday.val);
		};

		// Changing the time format
		$scope.changetimeformat = function (timeformat) {
			timeformatResource.post(timeformat.val).then(function (response) {
				OC.Notification.show(t('calendar', response.message));
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};
	}
]);

app.controller('SubscriptionController', ['$scope', '$window', 'SubscriptionModel', 'CalendarModel', 'EventsModel', 'Restangular',
	function ($scope, $window, SubscriptionModel, CalendarModel, EventsModel, Restangular) {

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

		var calendarResource = Restangular.all('calendars');

		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var backendResource = Restangular.all('backends-enabled');

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

		// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function (newid) {
			$scope.addEvent(newid); // Switches watch in CalController
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

	}
]);
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
			console.log(this.text);
			return this.text;
		}
	};

	return new Model();
});
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
			return this.calendarId[id];
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

app.factory('DialogModel', function() {
	return {
		initsmall: function(elementId) {
			$(elementId).dialog({
				width : 400,
				height: 300,
				resizable: false,
				draggable: false,
				close : function(event, ui) {
					$(this).dialog('destroy').remove();
				}
			});
		},
		initbig: function (elementId) {
			$(elementId).dialog({
				width : 500,
				height: 300,
				resizable: false,
				draggable: false,
				close : function(event, ui) {
					$(this).dialog('destroy').remove();
				}
			});
		},
		open: function (elementId) {
			$(elementId).dialog('open');
		}
	};
});
app.factory('EventsModel', function () {
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
		addAllDisplayFigures: function (calendarId, jcalData, start, end, timezone) {
			var components = new ICAL.Component(jcalData);
			var events = [];

			var dtstart = '';
			var dtend = '';
			var etag = '';
			var eventsId = '';
			var uri = '';
			var recurrenceId = null;
			var isAllDay = false;

			if (components.jCal.length !== 0) {
				var vtimezones = components.getAllSubcomponents("vtimezone");
				angular.forEach(vtimezones, function (vtimezone) {
					var timezone = new ICAL.Timezone(vtimezone);
					ICAL.TimezoneService.register(timezone.tzid, timezone);
				});

				var vevents = components.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (vevent) {
					// Todo : Repeating Calendar.
					if (vevent.hasProperty('dtstart')) {
						uri = vevent.getFirstPropertyValue('x-oc-uri');
						etag = vevent.getFirstPropertyValue('x-oc-etag');

						if (!vevent.hasProperty('dtstart')) {
							return;
						}
						dtstart = vevent.getFirstPropertyValue('dtstart');

						if (vevent.hasProperty('recurrence-id')) {
							recurrenceId = vevent.getFirstPropertyValue('recurrence-id').toICALString();
						}

						if (vevent.hasProperty('dtend')) {
							dtend = vevent.getFirstPropertyValue('dtend');
						} else if (vevent.hasProperty('duration')) {
							dtend = dtstart.clone();
							dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
						} else {
							dtend = dtstart.clone();
						}

						if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
							dtstart = dtstart.convertToZone(timezone);
						}

						if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
							dtend = dtend.convertToZone(timezone);
						}

						isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

						eventsId = uri;
						if (recurrenceId !== null) {
							eventsId = eventsId + recurrenceId;
						}

						events.push({
							"id": eventsId,
							"calendarId": calendarId,
							"objectUri": uri,
							"etag": etag,
							"recurrenceId": recurrenceId,
							"title": vevent.getFirstPropertyValue('summary'),
							"start": dtstart.toJSDate(),
							"end": dtend.toJSDate(),
							"allDay": isAllDay
						});
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
					this.eventobject = {
						"title" : this.vevents[i].getFirstPropertyValue('summary'),
						"location" : this.vevents[i].getFirstPropertyValue('location'),
						"categoties" : this.vevents[i].getFirstPropertyValue('category'),
						"description" : this.vevents[i].getFirstPropertyValue('description')
					};
				}
			}
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
});
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
