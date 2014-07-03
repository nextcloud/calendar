/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
