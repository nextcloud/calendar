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
			if (newid !== undefined && newid !== '') {
				var eventResource = Restangular.one('calendars/' + newid + '/events');
				eventResource.getList().then(function(jcalData) {
					EventsModel.addalldisplayfigures(jcalData);
				});
			}
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

			$scope.$watch('currentview.modelview', function (newview, oldview) {
				//console.log(newview) works here with ease.
				$scope.changeView = function(newview,calendar) {
					//console.log(newview) doesn't work.
					calendar.fullCalendar('changeView', newview);
				};
			});

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