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

app.controller('CalController', ['$scope', '$timeout', '$modal', '$routeParams', 'Restangular', 'calendar', 'CalendarModel', 'EventsModel',
	function ($scope,$timeout,$modal,$routeParams,Restangular,calendar,CalendarModel,EventsModel) {
		$scope.route = $routeParams;
		$scope.eventSources = EventsModel.getAll();
		$scope.currentview = CalendarModel;
		$scope.currentid = EventsModel;

		$scope.$watch('currentid.id', function (newid, oldid) {
			$scope.uiConfig = {
				calendar : {
					height: $(window).height() - $('#controls').height() - $('#header').height(),
					editable: true,
					selectable: true,
					selectHelper: true,
					select: $scope.newEvent,
					eventClick: $scope.editEvent,
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
					eventSources : [$scope.eventSources]
				},
			};

			$scope.$watch('currentview.modelview', function (newview, oldview) {
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

			$scope.$watch('currentview.datepickerview', function (newview, oldview) {
				$scope.changeview = function(newview,calendar) {
					calendar.fullCalendar(newview.view);
				};
				if (newview.view !== '' && $scope.calendar !== undefined) {
					$scope.changeview(newview,$scope.calendar);
				}
			}, true);

			$scope.$watch('currentview.date', function (newview, oldview) {
				$scope.gotodate = function(newview,calendar) {
					console.log(calendar);
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
