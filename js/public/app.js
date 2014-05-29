
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
				calendar: ['$route', '$q', 'is', 'Restangular',
				function ($route, $q, is, Restangular) {
					var deferred = $q.defer();
					var id = $route.current.params.id;
					is.loading = true;
					Restangular.one('calendars', id).get().then(function (calendar) {
						is.loading = false;
						deferred.resolve(calendar);
					}, function () {
						is.loading = false;
						deferred.reject();
					});

					return deferred.promise;
				}]
			}
		}).otherwise({
			redirectTo: '/'
		});

		var $window = $windowProvider.$get();
		var url = $window.location.href;
		var baseUrl = url.split('index.php')[0] + 'index.php/apps/calendar/v1';
		RestangularProvider.setBaseUrl(baseUrl);
	}
]).run(['$rootScope', '$location', 'CalendarModel',
	function ($rootScope, $location, CalendarModel) {
	$rootScope.$on('$routeChangeError', function () {
		var calendars = CalendarModel.getAll();
		console.log(calendars);
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
app.controller('CalController', ['$scope', '$timeout', '$routeParams', 'Restangular', 'CalendarModel', 'EventsModel',
	function ($scope,$timeout,$routeParams,Restangular,CalendarModel,EventsModel) {

		$scope.route = $routeParams;
		var id = $scope.route.id; 
		$scope.calendars = CalendarModel.getAll();

		/* All Date Objects */
		var date = new Date();
		var currentdate = date.getDate();
		var currentmonth = date.getMonth();
		var currentyear = date.getFullYear();

		var calendarResource = Restangular.one('calendars/' + id + '/events');

		calendarResource.getList().then(function(id) {
			EventsModel.addAll(id);
		});
	
		/* event source that contains custom events on the scope */
		$scope.events = [{
			title: 'Birthday Party',
			start: new Date(currentyear, currentmonth, currentdate + 1, 19, 0),
			end: new Date(currentyear, currentmonth, currentdate + 1, 22, 30),
			allDay: false,
			url: 'http://google.com'
		}];

		/* TODO : This shoudl trigger the dialouge box for adding the event. */
		$scope.alertOnEventClick = function(event,allDay,jsEvent,view ){
			$scope.alertMessage = (event.title + ' was clicked ');
		};
    	
    	/* add and removes an event source of choice */
    	$scope.addRemoveEventSource = function(sources,source) {
    		var canAdd = 0;
    		angular.forEach(sources,function(value, key){
    			if(sources[key] === source){
    				sources.splice(key,1);
    				canAdd = 1;
    			}
    		});
    		if (canAdd === 0) {
    			sources.push(source);
			}
		};
		/* add custom event*/
		$scope.addEvent = function() {
			$scope.events.push({
				title: 'Open Sesame',
				start: new Date(currentyear, currentmonth, 28),
				end: new Date(currentyear, currentmonth, 29),
				className: ['openSesame']
			});
		};

		/* remove event */
		$scope.remove = function(index) {
			å$scope.events.splice(index,1);
		};

		/* Change View */
		$scope.changeView = function(view,calendar) {
			calendar.fullCalendar('changeView',view);
		};

		/* Change View */
		$scope.renderCalender = function(calendar) {
			calendar.fullCalendar('render');
		};

		/* config object */
		$scope.uiConfig = {
			calendar:{
				height: 620,
				editable: true,
				header:{
					left: '',
					center: '',
					right: ''
				},
				eventClick: $scope.alertOnEventClick
			}
		};

		/* event sources array*/
		$scope.eventSources = [$scope.events];
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
	};

	EventsModel.prototype = {
		add : function (id) {
			this.events.push(id);
		},
		addAll : function (events) {
			for (var i=0; i<events.length; i++) {
				this.add(events[i]);
			}
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
app.factory('is', function () {
	return {
		loading: false
	};
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

