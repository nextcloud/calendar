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

app.controller('CalController', ['$scope', '$timeout', '$modal', '$routeParams', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel', 'ViewModel',
	function ($scope,$timeout,$modal,$routeParams,Restangular,calendar,CalendarModel,EventsModel,ViewModel) {
		$scope.route = $routeParams;
		$scope.eventSources = EventsModel.getAll();
		$scope.defaultView = ViewModel.getAll();
		$scope.calendarmodel = CalendarModel;
		$scope.eventsmodel = EventsModel;
		var viewResource = Restangular.one('view');

		viewResource.get().then( function (views) {
			ViewModel.add(views);
		});
		//$scope.defaultView = viewResource.get();

		$scope.$watch('eventsmodel.id', function (newid, oldid) {
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
					eventSources : [$scope.eventSources],
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
						//Calendar.UI.setViewActive(view.name);
						if (newview == 'agendaWeek') {
							$scope.calendar.fullCalendar('option', 'aspectRatio', 0.1);
						} else {
							$scope.calendar.fullCalendar('option', 'aspectRatio', 1.35);
						}
					},
				},
			};

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

			/* add custom event*/
			$scope.addEvent = function(newtitle,newstart,newend,newallday) {
				EventsModel.addEvent(newtitle,newstart,newend,newallday);
			};

			/* remove event */
			$scope.remove = function(index) {
				EventsModel.remove(index);
			};

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
		});
	}
]);
