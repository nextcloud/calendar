
var app = angular.module('Calendar', ['OC', 'ngAnimate', 'restangular', 'ngRoute']).
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
app.controller('NavController', ['$scope',
	function ($scope) {

	}
]);
app.controller('SettingsController', ['$scope','Restangular','TimezoneModel',
	function ($scope,Restangular,TimezoneModel) {

    $scope.timezone = TimezoneModel.getAll();

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
    $scope.changefirstday = function () {

    };
	}
]);

app.factory('TimezoneModel', function () {
   var TimezoneModel = function () {
     this.timezones = [];
     this.timezoneslist = [];
     this.timezoneId = {};
   };

   TimezoneModel.prototype = {
     getAll: function () {
       return this.timezones;
     },
     get: function (id) {
       return this.timezoneId[id];
     }
   };

   return new TimezoneModel();
 });

