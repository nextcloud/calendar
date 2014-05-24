
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
					Restangular.one('v1/calendars', id).get().then(function (calendar) {
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
		var baseUrl = url.split('index.php')[0] + 'index.php/apps/calendar';
		RestangularProvider.setBaseUrl(baseUrl);
	}
]).run(['$rootScope', '$location', 'CalendarModel',
	function ($rootScope, $location, CalendarModel) {

	$rootScope.$on('$routeChangeError', function () {
		var calendars = CalendarModel.getAll();

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
app.controller('CalController', ['$scope', '$timeout', '$routeParams', 'Restangular', 'CalendarModel',
	function ($scope,$timeout,$routeParams, Restangular, CalendarModel) {

		var uri = $routeParams;

		$scope.calendars = CalendarModel.getAll();

		/* All Date Objects */
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

		var calendarResource = Restangular.one('v1/calendars' + uri + '/events');

		/* event source that pulls from google.com */	
		$scope.eventSource = {
			url: "",
			className: '',           // an option!
			currentTimezone: '' // an option!
		};
	
		/* event source that contains custom events on the scope */
		$scope.events = [
			{title: 'All Day Event',start: new Date(y, m, 1)},
			{title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
			{id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
			{id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
			{title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false}
		];

		/* event source that calls a function on every view switch */
		$scope.eventsF = function (start, end, callback) {
			var s = new Date(start).getTime() / 1000;
			var e = new Date(end).getTime() / 1000;
			var m = new Date(start).getMonth();
			var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
			callback(events);
		};

		$scope.calEventsExt = {
			color: '#f00',
			textColor: 'yellow',
			events: [ 
				{type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
				{type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
				{type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
			]
		};

		/* alert on eventClick */
		$scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
			$scope.alertMessage = (event.title + ' was clicked ');
		};
		/* alert on Drop */
		 $scope.alertOnDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){
		 	$scope.alertMessage = ('Event Droped to make dayDelta ' + dayDelta);
		};
    
		/* alert on Resize */
		$scope.alertOnResize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
			$scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
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
				start: new Date(y, m, 28),
				end: new Date(y, m, 29),
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
				eventClick: $scope.alertOnEventClick,
				eventDrop: $scope.alertOnDrop,
				eventResize: $scope.alertOnResize
			}
		};

		/* event sources array*/
		$scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
		$scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
	}
]);
app.controller('CalendarListController', ['$scope','Restangular','CalendarModel',
	function ($scope,Restangular,CalendarModel) {

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('v1/calendars');

		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});

		$scope.newcolor = '';
		$scope.newCalendarInputVal = '';

		// Create a New Calendar
		$scope.create = function () {
			calendarResource.post().then(function (calendar) {
				CalendarModel.add(calendar);
			});
		};

		$scope.updatecalenderform = function () {
			//calendarResource.post().then(function (calendar) {
			//	CalendarModel.updateIfExists(calendar);
			//});
		};

		// To Delete a Calendar
		$scope.delete = function (id) {
			var calendar = CalendarModel.get(id);
			var delcalendarResource = Restangular.one('v1/calendars',id);
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
		var calendarResource = Restangular.all('v1/timezones');

		// Gets All Calendar Timezones.
		// TODO: Georg, explain me the structure of the JSON of the Timezones, it's weird.
		// this will change accordingly.
		// calendarResource.getList().then(function (timezones) {
		//	TimezoneModel.addAll(timezones);
		//});

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
			if (angular.isDefined(calendar)) {
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

