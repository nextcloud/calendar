
var app = angular.module('Calendar', ['OC', 'ngAnimate', 'restangular', 'ngRoute', 'ui.bootstrap']).
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
app.controller('CalController', ['$scope',
	function ($scope) {

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

 		$scope.create = function () {
 			calendarResource.post().then(function (calendar) {
 				CalendarModel.add(calendar);
 				$scope.path('/' + calendar.uri);
 			});
 		};

 		$scope.delete = function (calendarId) {
 			var calendar = CalendarModel.get(calendarId);
 			calendar.remove().then(function () {
 				CalendarModel.remove(calendarId);
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
    calendarResource.getList().then(function (timezones) {
      TimezoneModel.addAll(timezones);
    });

    console.log($scope.timezones);

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

    // Creating Timezone, not yet implemented Server Side.
    $scope.create = function () {
      calendarResource.post().then(function (newtimezone) {
        TimezoneModel.add(newtimezone);
      });
    };

    // Deleting Timezone, not yet implemented Server Side.
    $scope.delete = function (timezoneId) {
      var timezone = TimezoneModel.get(timezoneId);
      timezone.remove().then(function () {
        TimezoneModel.remove(timezoneId);
      });
    };
	}
]);

app.factory('CalendarModel', function() {
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
	};

	CalendarModel.prototype = {
		add: function (calendar) {
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
		get : function (id) {
			return this.calendarId[id];
		},
		updateIfExists : function () {

		},
		create : function () {

		},
		remove : function (uri) {
			for (var i=0; i<this.calendars.length; i++) {
				var calendar = this.calendars[i];
				if (calendar.uri === uri) {
					this.calendars.splice(i, 1);
					delete this.calendarId[uri];
					break;
				}
			}
		},
	};

	return new CalendarModel();
});

app.factory('TimezoneModel', function () {
	var TimezoneModel = function () {
		this.timezones = [];
		this.timezoneslist = [];
		this.timezoneId = {};
	};

	TimezoneModel.prototype = {
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
		add: function (timezone) {
			return 0;
		},
		delete: function (id) {
			return 0;
		}
	};

	return new TimezoneModel();
});

