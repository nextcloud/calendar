
var app = angular.module('Calendar', [
	'OC',
	'ngAnimate',
	'restangular',
	'ngRoute',
	'ui.bootstrap',
	'ui.calendar',
	'colorpicker.module'
]).config(['$provide', '$routeProvider', 'RestangularProvider', '$httpProvider', '$windowProvider',
	function ($provide,$routeProvider,RestangularProvider,$httpProvider,$windowProvider) {

		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

		$routeProvider.when('/:id', {
			templateUrl : 'calendar.html',
			controller : 'CalController',
			resolve : {
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
		}).otherwise({
			redirectTo: '/'
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
		console.log(events);
		if (calendars.length > 0) {
			var calendar = calendars[calendars.length-1];
			$location.path('/' + calendar.id);
		} else {
			$location.path('/');
		}
	});
}]);

app.controller('AppController', ['$scope',
	function ($scope) {

	}
]);
app.controller('CalController', ['$scope','$timeout', '$modal', '$routeParams', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel',
	function ($scope,$timeout,$modal,$routeParams,Restangular,calendar,CalendarModel,EventsModel) {
		$scope.route = $routeParams;
		$scope.eventSources = EventsModel.getAll();
		var id = $scope.route.id;
		$scope.currentcalendar = CalendarModel.get(id);
		console.log($scope.calendar);
		var eventResource = Restangular.one('calendars/' + id + '/events');
		eventResource.getList().then(function(jcalData) {
			EventsModel.addalldisplayfigures(jcalData);
			$scope.uiConfig = {
				calendar : {
					height: $(window).height() - $('#controls').height() - $('#header').height(),
					editable: true,
					selectable: true,
					selectHelper: true,
					select: $scope.newEvent,
					eventClick: $scope.editEvent,
					eventColor: $scope.currentcalendar.color,
					header:{
						left: '',
						center: '',
						right: 'prev next'
					},
					columnFormat: {
						month: t('calendar', 'ddd'),
						week: t('calendar', 'ddd M/d'),
						day: t('calendar', 'dddd M/d')
					},
					titleFormat: {
						month: t('calendar', 'MMMM yyyy'),
						week: t('calendar', "MMM d[ yyyy]{ '–'[ MMM] d yyyy}"),
						day: t('calendar', 'dddd, MMM d, yyyy'),
					},
					eventSources : [$scope.eventSources]
				},
			};
			console.log($scope.uiConfig);

			$scope.changeView = function(view,calendar) {
				calendar.fullCalendar('changeView',view);
			};

			$scope.renderCalender = function(calendar) {
				if (calendar) {
					calendar.fullCalendar('render');
				}
			};

			/* Removes Event Sources */
			$scope.addEventSource = function(sources,source) {
				EventsModel.addEventSource(sources,source);
			};

			/* Adds Event Sources */
			$scope.removeEventSource = function(sources,source) {
				EventsModel.removeEventSource(sources,source);
			};

			/* add custom event*/
			$scope.addEvent = function(newtitle,newstart,newend,newallday) {
				EventsModel.addEvent(newtitle,newstart,newend,newallday);
			};

			/* remove event */
			$scope.remove = function(index) {
				EventsModel.remove(index);
			};
		});

		$scope.newEvent = function () {
			$modal.open({
				templateUrl: 'event.dialog.html',
				controller: 'EventsModalController',
			});
			EventsModel.newEvent();
		};

		/* TODO : This and new event can be merged */
		$scope.editEvent = function () {
			$modal.open({
				templateUrl: 'event.dialog.html',
				controller: 'EventsModalController'
			});
			EventsModel.editEvent();
		};
	}
]);
app.controller('CalendarListController', ['$scope','Restangular','CalendarModel','$routeParams',
	function ($scope,Restangular,CalendarModel,$routeParams) {

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});
		
		$scope.route = $routeParams;
		var id = $scope.route.id; 
		$scope.newcolor = '';
		$scope.newCalendarInputVal = '';

		// Create a New Calendar
		$scope.create = function (newCalendarInputVal, newcolor) {
			var newCalendar = {
				"displayname" : $scope.newCalendarInputVal,
				"color" : $scope.newcolor,
				"components" : {
					"vevent" : true,
					"vjournal" : true,
					"vtodo" : true
				}
			};
			calendarResource.post(newCalendar).then(function (newCalendar) {
				CalendarModel.create(newCalendar);
			});
		};

		$scope.download = function (id) {
			var deletecalendarResource = Restangular.one('calendars/', id, '/export');
			//deletecalendarResource.get(id).then( function (id) {
			//});
		};

		// Sharing Logic Comes Here.
		$scope.share = function (sharewith) {

		};

		$scope.updatecalenderform = function () {
			//calendarResource.post().then(function (calendar) {
			//	CalendarModel.updateIfExists(calendar);
			//});
		};

		// To Delete a Calendar
		$scope.delete = function (id) {
			var calendar = CalendarModel.get(id);
			var delcalendarResource = Restangular.one('calendars',id);
			delcalendarResource.remove().then( function () {
				CalendarModel.remove(calendar);
			});
		};
	}
]);

app.controller('DatePickerController', ['$scope',
  function ($scope) {
  	$scope.changeDatePickerDisplay = function () {
  		console.log('yoyoyoyoy');
  	};
  }
]);

app.controller('EventsModalController', ['$scope',
	function ($scope) {

	}
]);
app.controller('NavController', ['$scope',
	function ($scope) {

	}
]);
app.controller('SettingsController', ['$scope','Restangular','$routeParams','TimezoneModel',
	function ($scope,Restangular,$routeParams,TimezoneModel) {

		// In case, routes are need.
		$scope.route = $routeParams;
		$scope.timezones = TimezoneModel.getAll();
		var calendarResource = Restangular.all('timezones');

		// Time Format Dropdown
		$scope.timeformatSelect = [
			{ time : t('calendar', '24h'), val : '24' },
			{ time : t('calendar' , '12h'), val : 'ampm' }
		];

		// First Day Dropdown
		$scope.firstdaySelect = [
			{ day : t('calendar', 'Monday'), val : 'mo' },
			{ day : t('calendar', 'Sunday'), val : 'su' },
			{ day : t('calendar', 'Saturday'), val : 'sa' }
		];

		// Changing the first day
		$scope.changefirstday = function (firstday) {
		};
	}
]);

app.directive('loading',
	[ function() {
		return {
			restrict: 'E',
			replace: true,
			template:"<div id='loading' class='icon-loading'></div>",
	    	link: function($scope, element, attr) {
				$scope.$watch('loading', function(val) {
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
app.factory('CalendarModel', function() {
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
	};

	CalendarModel.prototype = {
		create : function (newcalendar) {
			this.calendars.push(newcalendar);
		},
		add : function (calendar) {
			this.updateIfExists(calendar);
		},
		addAll : function (calendars) {
			for(var i=0; i<calendars.length; i++) {
				this.add(calendars[i]);
			}
		},
		getAll : function () {
			return this.calendars;
		},
		get : function (id) {
			return this.calendarId[id];
		},
		updateIfExists : function (updated) {
			var calendar = this.calendarId[updated.id];
			if(angular.isDefined(calendar)) {
				calendar.displayname = updated.displayname;
				calendar.color = updated.color;
			} else {
				this.calendars.push(updated);
				this.calendarId[updated.id] = updated;
			}
		},
		remove : function (id) {
			for(var i=0; i<this.calendars.length; i++) {
				var calendar = this.calendars[i];
				if (calendar.id === id) {
					this.calendars.splice(i, 1);
					delete this.calendarId[id];
					break;
				}
			}
		},
	};

	return new CalendarModel();
});

app.factory('EventsModel', function () {
	var EventsModel = function () {
		this.events = [];
		this.eventsUid = {};
		this.calendars = [];
		this.calendarId = {};
	};

	EventsModel.prototype = {
		addalldisplayfigures : function (jcalData) {
			var rawdata = new ICAL.Component(jcalData);
			var fields = [];
			var self = this;
			var isAllDay;
			if (rawdata.jCal.length !== 0) {
				var vevents = rawdata.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (value,key) {
					var start = value.getFirstPropertyValue('dtstart');
					var end = value.getFirstPropertyValue('dtend');
					if (start.icaltype == 'date' && end.icaltype == 'date') {
						isAllDay = true;
					} else {
						isAllDay = false;
					}
					self.events.push({
						"title" : value.getFirstPropertyValue('summary'),
						"start" : start.toJSDate(),
						"end" : end.toJSDate(),
						"allDay" : isAllDay
					});
				});
			}
		},
		addEventSource : function (sources,source) {
			return 0;
		},
		removeEventSource : function (sources,source) {
			return 0;
		},
		alertMessage : function (title,start,end,allday) {
			return 0;
		},
		addEvent : function (title,start,end,allDay) {
			this.events.push({
				"title" : title,
				"start" : start,
				"end" : end,
				"allDay" : allDay
			});
		},
		newEvent: function() {
		},
		getAll : function () {
			return this.events;
		},
		get : function (id) {

		},
		remove : function (id) {
			delete this.id;
		}
	};

	return new EventsModel();
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
			for(var i=0; i<timezones.length; i++) {
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
		}
	};

	return new TimezoneModel();
});

