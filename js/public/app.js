
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

app.controller('CalController', ['$scope', '$modal', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel', 'ViewModel', 'TimezoneModel',
	function ($scope, $modal, Restangular, calendar, CalendarModel, EventsModel, ViewModel, TimezoneModel) {
		$scope.eventSources = EventsModel.getAll();
		$scope.defaultView = ViewModel.getAll();
		$scope.calendarmodel = CalendarModel;
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
		$scope.calendars = $scope.calendarmodel.getAll();

		$scope.addRemoveEventSources = function (newid, calendar) {
			$scope.i++;
			if (switcher.indexOf(newid) > -1) {
				switcher.splice(switcher.indexOf(newid), 1);
				Restangular.one('calendars', newid).patch({'enabled': false}).then(function (blah) {
					CalendarModel.toggleactive(newid,blah.enabled);
				});
				calendar.fullCalendar('removeEventSource', $scope.eventSource[newid]);
			} else {
				switcher.push(newid);
				Restangular.one('calendars', newid).patch({'enabled': true}).then(function (blah) {
					CalendarModel.toggleactive(newid,blah.enabled);
				});
				calendar.fullCalendar('addEventSource', $scope.eventSource[newid]);
			}
		};

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
					angular.element('#calendarlist li a[data-id=' + value.id + ']').parent().addClass('active');
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
				//eventColor: $scope.currentcalendar.color,
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
					EventsModel.putmodalproperties(event,jsEvent,view);
				},
				eventResize: function (event, delta, revertFunc) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						var data = EventsModel.eventResizer(event, delta, eventsobject);
						if (data === null) {
							revertFunc();
						}
					}, function (response) {
						OC.Notification.show(t('calendar', response.data.message));
					});
				},
				eventDrop: function (event, delta, revertFunc) {
					Restangular.one('calendars', event.calendarId).one('events', event.objectUri).get().then(function (eventsobject) {
						var data = EventsModel.eventDropper(event, delta, eventsobject);
						if (data === null) {
							revertFunc();
						}
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

		$scope.$watch('eventsmodel.calid', function (newid, oldid) {
			newid = newid.id;
			if (newid !== '') {
				$scope.addRemoveEventSources(newid, $scope.calendar);
			}
		}, true);

		$scope.$watch('calendarmodel.activator', function (newobj, oldobj) {
			if (newobj.id !== '') {
				if (newobj.bool === true) {
					angular.element('#calendarlist li a[data-id=' + newobj.id + ']').parent().addClass('active');
				} else {
					angular.element('#calendarlist li a[data-id=' + newobj.id + ']').parent().removeClass('active');
				}
			}
		}, true);

		$scope.$watch('calendarmodel.modelview', function (newview, oldview) {
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

		$scope.$watch('calendarmodel.datepickerview', function (newview, oldview) {
			$scope.changeview = function (newview, calendar) {
				calendar.fullCalendar(newview.view);
			};
			if (newview.view !== '' && $scope.calendar !== undefined) {
				$scope.changeview(newview, $scope.calendar);
			}
		}, true);

		$scope.$watch('calendarmodel.date', function (newview, oldview) {
			$scope.gotodate = function (newview, calendar) {
				calendar.fullCalendar('gotoDate', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.gotodate(newview, $scope.calendar);
			}
		});

		$scope.$watch('calendarmodel.firstday', function (newview, oldview) {
			$scope.firstdayview = function (newview,calendar) {
				calendar.fullCalendar('firstDay', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.firstdayview(newview, $scope.calendar);
			}
		});
	}
]);

app.controller('CalendarListController', ['$scope', '$window', '$location', '$routeParams', 'Restangular', 'CalendarModel', 'EventsModel',
	function ($scope, $window, $location, $routeParams, Restangular, CalendarModel, EventsModel) {

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});

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
		$scope.create = function (newCalendarInputVal, newcolor) {
			var newCalendar = {
				"displayname": $scope.newCalendarInputVal,
				"color": $scope.newcolor,
				"components": {
					"vevent": true,
					"vjournal": true,
					"vtodo": true
				},
				"enabled": true
			};
			calendarResource.post(newCalendar).then(function (newCalendar) {
				CalendarModel.create(newCalendar);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		$scope.download = function (id) {
			$window.open('v1/calendars/' + id + '/export');
		};

		// Sharing Logic Comes Here.
		$scope.share = function (sharewith) {

		};

		// CalDAV display - hide logic goes here.
		$scope.toggleCalDAV = function ($index, uri, id) {
			$scope.i.push($index);
			$scope.calDAVmodel = OC.linkToRemote('caldav') + '/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/' + escapeHTML(encodeURIComponent(uri));
		};

		$scope.updatecalendarform = function ($index, id, displayname, color) {
			if ($scope.editfieldset === id) {
				$scope.editfieldset = null;
			} else {
				$scope.editfieldset = id;
			}
			$scope.editmodel = displayname;
			$scope.editcolor = color;

			$scope.update = function (id, updatedname, updatedcolor, vevent, vjournal, vtodo) {
				var updated = {
					"displayname": updatedname,
					"color": updatedcolor,
					"components": {
						"vevent": vevent,
						"vjournal": vjournal,
						"vtodo": vtodo
					}
				};
				Restangular.one('calendars', id).patch(updated);
			};
		};

		// To Delete a Calendar
		$scope.delete = function (id) {
			var calendar = CalendarModel.get(id);
			var delcalendarResource = Restangular.one('calendars', id);
			delcalendarResource.remove().then(function () {
				CalendarModel.remove(calendar);
				angular.element('#calendarlist li a[data-id=' + id + ']').parent().remove();
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

app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'Model',
	function ($scope, $routeParams, Restangular, CalendarModel, TimezoneModel, EventsModel, Model) {
		
		$scope.eventsmodel = EventsModel;

		$scope.initDialog = angular.element('#event').dialog({
			width : 500,
			height: 600,
			resizable: false,
			draggable: false,
			close: function(event, ui) {
				$(this).dialog('destroy').remove();
			}
		});
	}
]);
app.controller('SettingsController', ['$scope', 'Restangular', 'CalendarModel',
	function ($scope, Restangular, CalendarModel) {

		$scope.hiddencalendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');

		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var firstdayResource = Restangular.one('firstDay');
		firstdayResource.get().then(function (firstdayobject) {
			$scope.selectedday = firstdayobject.value;
		}, function(response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var timeformatResource = Restangular.one('timeFormat');
		timeformatResource.get().then(function (timeFormatobject) {
			$scope.selectedtime = timeFormatobject.value;
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));

		});

		// Time Format Dropdown
		$scope.timeformatSelect = [
			{ time: t('calendar', '24h'), val: '24' },
			{ time: t('calendar', '12h'), val: 'ampm' }
		];

		// First Day Dropdown
		$scope.firstdaySelect = [
			{ day: t('calendar', 'Monday'), val: 'mo' },
			{ day: t('calendar', 'Sunday'), val: 'su' },
			{ day: t('calendar', 'Saturday'), val: 'sa' }
		];

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
		this.date = new Date();
	};

	CalendarModel.prototype = {
		create: function (newcalendar) {
			this.calendars.push(newcalendar);
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
		remove: function (id) {
			for (var i = 0; i < this.calendars.length; i++) {
				var calendar = this.calendars[i];
				if (calendar.id === id) {
					this.calendars.splice(i, 1);
					delete this.calendarId[id];
					break;
				}
			}
		},
		pushdatepickerview: function (view, date) {
			this.datepickerview.id = Math.random(1000);
			this.datepickerview.view = view;
		},
		getdatepickerview: function (view) {
			return this.datepickerview;
		},
		pushtoggleview: function (view) {
			this.modelview.id = Math.random(1000);
			this.modelview.view = view;
		},
		gettoggleview: function () {
			return this.modelview;
		},
		pushtodaydatepicker: function () {
			this.today.id = Math.random(1000);
		},
		gettodaydatepicker: function () {
			return this.today;
		},
		pushdate: function (date) {
			this.date = date;
		},
		getdate: function () {
			return this.date;
		},
		pushfirstday: function (val) {
			this.firstday = moment().day(val).day();
		},
		getfirstday: function () {
			return this.firstday;
		},
		toggleactive: function (id,bool) {
			this.activator.id = id;
			this.activator.bool = bool;
		}
	};

	return new CalendarModel();
});

app.factory('EventsModel', function () {
	var EventsModel = function () {
		this.events = [];
		this.eventsUid = {};
		this.calid = {
			id: '',
			changer: ''
		}; // required for switching the calendars on the fullcalendar
		this.eventsmodalproperties = {};
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

			return (didFindEvent) ? components.toJSON() : null;
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

			return (didFindEvent) ? components.toJSON() : null;
		},
		putmodalproperties: function (event,jsEvent,view) {
			this.eventsmodalproperties = {
				"event": event,
				"jsEvent": jsEvent,
				"view": view
			};
		},
		getmodalproperties: function () {
			return this.eventsmodalproperties;
		},
		addEvent: function (id) {
			this.calid.changer = Math.random(1000);
			this.calid.id = id;
		},
		getEvent: function () {
			return this.calid;
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
