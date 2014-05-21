
var app = angular.module('Calendar', ['OC', 'ngAnimate', 'restangular', 'ngRoute', 'ui.bootstrap', 'ui.calendar']).
config(['$provide', '$routeProvider', 'RestangularProvider', '$httpProvider', '$windowProvider',
	function ($provide,$routeProvider,RestangularProvider,$httpProvider,$windowProvider) {

		$httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;

		var $window = $windowProvider.$get();
		var url = $window.location.href;
		var baseUrl = url.split('index.php')[0] + 'index.php/apps/calendar';
		RestangularProvider.setBaseUrl(baseUrl);
	}
]);

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

 		// Create a New Calendar
 		$scope.create = function () {
 			calendarResource.post().then(function (calendar) {
 				CalendarModel.add(calendar);
 				$scope.path('/' + calendar.uri);
 			});
 		};

 		// To Delete a Calendar
 		$scope.delete = function (uri,backend) {
 			var calendar = CalendarModel.get(uri);
 			var delcalendarResource = Restangular.one('v1/calendars',backend + '::' + uri);
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
			this.calendars.push(calendar);
		},
		addAll : function (calendars) {
			for(var i=0; i<calendars.length; i++) {
				this.add(calendars[i]);
			}
		},
		getAll : function () {
			return this.calendars;
		},
		get : function (uri) {
			for (var i = 0; i<this.calendars.length;i++) {
				var calendar = this.calendars[i];
				if (calendar.uri === uri) {
					this.calendarId = this.calendars[i];
					break;
				}
			}
			return this.calendarId;
		},
		updateIfExists : function () {

		},
		remove : function (calendar) {
			console.log(calendar);
			// Todo: Splice of the Calendar Input here instead the calendar.
			delete this.calendar;
		},
	};

	return new CalendarModel();
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

