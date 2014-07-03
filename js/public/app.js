
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

		$routeProvider.when('/', {
			templateUrl : 'calendar.html',
			controller : 'CalController',
			resolve : {
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

app.controller('AppController', ['$scope',
	function ($scope) {

	}
]);
app.controller('CalController', ['$scope', '$modal', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel', 'ViewModel',
	function ($scope,$modal,Restangular,calendar,CalendarModel,EventsModel,ViewModel) {
		$scope.eventSources = EventsModel.getAll();
		$scope.defaultView = ViewModel.getAll();
		$scope.calendarmodel = CalendarModel;
		$scope.eventsmodel = EventsModel;
		$scope.i = 0;
		var switcher = [];
		var viewResource = Restangular.one('view');

		// Responds to change in View from calendarlistcontroller.
		viewResource.get().then( function (views) {
			ViewModel.add(views);
		});
		//$scope.defaultView = viewResource.get();

		$scope.eventSource = {};
		$scope.calendars = $scope.calendarmodel.getAll();

		$scope.addRemoveEventSources = function (newid,calendar) {
			$scope.i++;
			if (switcher.indexOf(newid) > -1) {
				switcher.splice(switcher.indexOf(newid),1);
				calendar.fullCalendar('removeEventSource', $scope.eventSource[newid]);
			} else {
				switcher[$scope.i] = newid;
				calendar.fullCalendar('addEventSource', $scope.eventSource[newid]);
			}
		};

		$scope.uiConfig = {
			calendar : {
				height: $(window).height() - $('#controls').height() - $('#header').height(),
				editable: true,
				selectable: true,
				selectHelper: true,
				select: $scope.newEvent,
				eventClick: $scope.editEvent,
				defaultView: $scope.defaultView,
				//eventColor: $scope.currentcalendar.color,
				header:{
					left: '',
					center: '',
					right: ''
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
				viewRender : function(view) {
					$('#datecontrol_current').html($('<p>').html(view.title).text());
					$( "#datecontrol_date" ).datepicker("setDate", $scope.calendar.fullCalendar('getDate'));
					var newview = view.name;
					if (newview != 'month') {
						viewResource.get().then(function(newview) {
							ViewModel.add(newview);
						});
						$scope.defaultView = newview;
					}
					if(newview === 'agendaDay') {
						$('td.fc-state-highlight').css('background-color', '#ffffff');
					} else {
						$('td.fc-state-highlight').css('background-color', '#ffc');
					}
					if (newview == 'agendaWeek') {
						$scope.calendar.fullCalendar('option', 'aspectRatio', 0.1);
					} else {
						$scope.calendar.fullCalendar('option', 'aspectRatio', 1.35);
					}
				},
			},
		};

		angular.forEach($scope.calendars, function (value,key) {
			if ($scope.eventSource[value.id] === undefined) {
				$scope.eventSource[value.id] = {
					events: function (start, end, timezone, callback) {
						Restangular.one('calendars', value.id).getList('events').then(function (eventsobject) {
							callback(EventsModel.addalldisplayfigures(eventsobject));
						});
					},
					color: value.color,
					editable: value.cruds.update,
					id: value.id
				};
				$scope.addRemoveEventSources(value.id, $scope.calendar); // This is buggy. $scope.calendar is undefined.
			}
		});

		$scope.$watch('eventsmodel.calid', function (newid, oldid) {
			newid = newid.id;
			if (newid !== '') {
				$scope.addRemoveEventSources(newid,$scope.calendar);
			}
		}, true);

		$scope.$watch('calendarmodel.modelview', function (newview, oldview) {
			$scope.changeView = function(newview,calendar) {
				calendar.fullCalendar('changeView', newview);
			};
			$scope.today = function (calendar) {
				calendar.fullCalendar('today');
			};
			if (newview.view && $scope.calendar) {
				if (newview.view != 'today') {
					$scope.changeView(newview.view,$scope.calendar);
				} else {
					$scope.today($scope.calendar);
				}
			}
		}, true);

		$scope.$watch('calendarmodel.datepickerview', function (newview, oldview) {
			$scope.changeview = function(newview,calendar) {
				calendar.fullCalendar(newview.view);
			};
			if (newview.view !== '' && $scope.calendar !== undefined) {
				$scope.changeview(newview,$scope.calendar);
			}
		}, true);

		$scope.$watch('calendarmodel.date', function (newview, oldview) {
			$scope.gotodate = function(newview,calendar) {
				calendar.fullCalendar('gotoDate', newview);
			};
			if (newview !== '' && $scope.calendar !== undefined) {
				$scope.gotodate(newview,$scope.calendar);
			}
		});
	}
]);

app.controller('CalendarListController', ['$scope','Restangular','CalendarModel','EventsModel','$routeParams',
	function ($scope,Restangular,CalendarModel,EventsModel,$routeParams) {

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});
		
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

		// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function(newid) {
			$scope.addEvent(newid); // Switches watch in CalController
		};

		$scope.eventFilter = function() {
			return function(item) {
				return item.components.vevent === true;
			};
		};

		$scope.calendarFilter = function() {
			return function(item) {
				return (
					item.cruds.create === true ||
					item.cruds.update === true ||
					item.cruds.delete === true
				);
			};
		};

		$scope.subscriptionFilter = function() {
			return function(item) {
				return (
					item.cruds.create === false &&
					item.cruds.update === false &&
					item.cruds.delete === false
				);
			};
		};

	}
]);

app.controller('DatePickerController', ['$scope', 'CalendarModel',
	function ($scope,CalendarModel) {

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
	function ($scope,$routeParams,Restangular,CalendarModel,TimezoneModel,EventsModel,Model) {

		$scope.route = $routeParams;
		var id = $scope.route.id;
		$scope.calendars = CalendarModel.getAll();
		$scope.timezones = TimezoneModel.getAll();
		var eventResource = Restangular.one('calendars', id).one('events');
		var timezoneResource = Restangular.one('timezones-list');
		//var onetimezoneResource = Restangular.one('timezones', timezoneid);
		//var timezone = onetimezoneResource.get(timezoneid);

		// Initiates all models required to create a new calendar event
		$scope.summary = '';
		$scope.dtstart = '';
		$scope.dtend = '';
		$scope.location = '';
		$scope.categories = '';
		$scope.description = '';

		$scope.repeatevents = [
			{title : t('calendar', 'Daily'), id : 1 },
			{title : t('calendar', 'Weekly'), id : 2 },
			{title : t('calendar', 'Every Weekday'), id : 3 },
			{title : t('calendar', 'Bi-weekly'), id : 4 },
			{title : t('calendar', 'Monthly'), id : 5 },
			{title : t('calendar', 'Yearly'), id : 6 }
		];

		$scope.endintervals = [
			{title : t('calendar', 'Never'), id : 1 },
			{title : t('calendar', 'by occurances'), id : 2 },
			{title : t('calendar', 'by date'), id : 3 },
		];

		$scope.currenttz = TimezoneModel.currenttimezone().toUpperCase();
		console.log($scope.currenttz);

		$scope.create = function() {
			var newevent = {
				"currenttimezone" : $scope.currenttz,
				"uid" : Model.uidgen,
				"summary" : $scope.summary,
				"dtstart" : $scope.dtstart,
				"dtend" : $scope.dtend,
				"description" : $scope.description,
				"location" : $scope.location,
				"categories" : $scope.categories,
				"allday" : $scope.allday
				//"last-modified" : $scope.lastmodified
				//"vtimezone" : TimezoneModel.getAll()
			};
			eventResource.post().then(function () {
				console.log(newevent);
				EventsModel.create(newevent);
			});
		};

		timezoneResource.getList().then(function (timezones) {
			TimezoneModel.addAll(timezones);
		});
	}
]);
app.controller('NavController', ['$scope',
	function ($scope) {

	}
]);
app.controller('SettingsController', ['$scope','Restangular',
	function ($scope,Restangular) {

		var firstdayResource = Restangular.one('firstDay');
		firstdayResource.get().then(function (firstdayobject) {
			$scope.selectedday = firstdayobject.firstday;
		});

		var timeformatResource = Restangular.one('timeFormat');
		timeformatResource.get().then(function (timeFormatobject) {
			$scope.selectedtime = timeFormatobject.timeformat;
		});

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
			firstdayResource.post(firstday.val).then(function () {
				// TODO : Add a OC notification if the request is successful.
			}, function () {
				// TODO : Add a OC notification if the request is not successful.
			});
		};

		// Changing the time format
		$scope.changetimeformat = function (timeformat) {
			timeformatResource.post(timeformat.val).then(function () {
				// TODO : Add a OC notification if the request is successful.
			}, function () {
				// TODO : Add a OC notification if the request is not successful.
			});
		};
	}
]);

app.controller('SubscriptionController', ['$scope', 'SubscriptionModel', 'CalendarModel', 'Restangular',
	function ($scope,SubscriptionModel,CalendarModel,Restangular) {
		
		$scope.subscriptions = SubscriptionModel.getAll();
		$scope.calendars = CalendarModel.getAll();
		
		var subscriptionResource = Restangular.all('subscriptions');
		subscriptionResource.getList().then(function (subscriptions) {
			SubscriptionModel.addAll(subscriptions);
		});

		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});
		
		var backendResource = Restangular.all('backends-enabled');
		backendResource.getList().then(function (backendsobject) {
			$scope.subscriptiontypeSelect = SubscriptionModel.getsubscriptionnames(backendsobject);
			$scope.selectedsubscriptionbackendmodel = $scope.subscriptiontypeSelect[0]; // to remove the empty model.
		});

		$scope.newSubscriptionUrl = '';

		$scope.create = function(newSubscriptionInputVal) {
			var newSubscription = {
				"type": $scope.selectedsubscriptionbackendmodel.type,
				"url": $scope.newSubscriptionUrl,
			};
			subscriptionResource.post(newSubscription).then(function (newSubscription) {
				SubscriptionModel.create(newSubscription);
			});
		};

		$scope.calendarFilter = function() {
			return function(item) {
				return (
					item.cruds.create === true ||
					item.cruds.update === true ||
					item.cruds.delete === true
				);
			};
		};

		// Take the filters to the filters directory, else duplication will happen.
		$scope.subscriptionFilter = function() {
			return function(item) {
				return (
					item.cruds.create === false &&
					item.cruds.update === false &&
					item.cruds.delete === false
				);
			};
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
app.factory('Model', function () {
	var Model = function () {
		this.text = '';
		this.possible = '';
	};

	Model.prototype = {
		uidgen : function () {
			this.possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for(var i=0; i < 5; i++) {
				this.text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			console.log(this.text);
			return this.text;
		}
	};

	return new Model();
});
app.factory('CalendarModel', function() {
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
		this.modelview = {
			id : '',
			view : ''
		};
		this.datepickerview = {
			id : '',
			view : ''
		};
		this.today = {
			id : '',
			date : new Date()
		};
		this.date = new Date();
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
		pushdatepickerview : function (view,date) {
			this.datepickerview.id = Math.random(1000);
			this.datepickerview.view = view;
		},
		getdatepickerview : function (view) {
			return this.datepickerview;
		},
		pushtoggleview : function (view) {
			this.modelview.id = Math.random(1000);
			this.modelview.view = view;
		},
		gettoggleview : function () {
			return this.modelview;
		},
		pushtodaydatepicker : function () {
			this.today.id = Math.random(1000);
		},
		gettodaydatepicker : function () {
			return this.today;
		},
		pushdate : function (date) {
			this.date = date;
		},
		getdate : function () {
			return this.date;
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
	};

	EventsModel.prototype = {
		create : function (newevent) {
			var rawdata = new ICAL.Event();
			this.events.push(rawdata);
		},
		addalldisplayfigures : function (jcalData) {
			var events = [];
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
					events[key] = {
						"title" : value.getFirstPropertyValue('summary'),
						"start" : start.toJSDate(),
						"end" : end.toJSDate(),
						"allDay" : isAllDay
					};
				});
			}
			return events;
		},
		alertMessage : function (title,start,end,allday) {
			return 0;
		},
		addEvent: function(id) {
			this.calid.changer = Math.random(1000); 
			this.calid.id = id;
		},
		getEvent: function() {
			return this.calid;
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
app.factory('SubscriptionModel', function() {
	var SubscriptionModel = function () {
		this.subscriptions = [];
		this.subscriptionId = {};
		this.subscriptiondetails = [];
	};

	SubscriptionModel.prototype = {
		create : function (newsubscription) {
			this.subscriptions.push(newsubscription);
		},
		add : function (subscription) {
			this.updateIfExists(subscription);
		},
		addAll : function (subscriptions) {
			for(var i=0; i<subscriptions.length; i++) {
				this.add(subscriptions[i]);
			}
		},
		getAll : function () {
			return this.subscriptions;
		},
		get : function (id) {
			return this.subscriptionId[id];
		},
		updateIfExists : function (updated) {
			var subscription = this.subscriptionId[updated.id];
			if(angular.isDefined(subscription)) {

			} else {
				this.subscriptions.push(updated);
				this.subscriptionId[updated.id] = updated;
			}
		},
		remove : function (id) {
			for(var i=0; i<this.subscriptions.length; i++) {
				var subscription = this.subscriptions[i];
				if (subscription.id === id) {
					this.subscriptions.splice(i, 1);
					delete this.subscriptionId[id];
					break;
				}
			}
		},
		getsubscriptionnames : function (backendobject) {
			for (var i = 0; i<backendobject.length; i++) {
				for (var j = 0; j<backendobject[i].subscriptions.length; j++) {
					this.subscriptiondetails = [{
						"name": backendobject[i].subscriptions[j].name,
						"type" : backendobject[i].subscriptions[j].type
					}];
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
		},
		currenttimezone: function() {
			var timezone = jstz.determine();
			return timezone.name();
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
			for(var i=0; i<views.length; i++) {
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
