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

app.controller('CalController', ['$scope', '$timeout', '$routeParams', 'Restangular', 'CalendarModel', 'EventsModel',
	function ($scope,$timeout,$routeParams,Restangular,CalendarModel,EventsModel) {

		$scope.route = $routeParams;
		var id = $scope.route.id; 
		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.one('calendars/' + id + '/events');

		calendarResource.getList().then(function(id) {
			$scope.events = EventsModel.addalldisplayfigures(id);
			$scope.config();
		});

		$scope.config = function () {
			/* config object */
			$scope.uiConfig = {
				calendar:{
					height: 620,
					editable: true,
					header:{
						left: '',
						center: '',
						right: 'prev next'
					},
					eventClick: $scope.alertOnEventClick,
					eventSources : [$scope.events]
				}
			};

			/* TODO : This shoudl trigger the dialouge box for adding the event. */
			$scope.alertOnEventClick = function(event,allDay,jsEvent,view ){
				$scope.alertMessage = EventsModel.alertMessage(event.title,event.start,event.end,event.allDay);
			};

			/* add custom event*/
			$scope.addEvent = function(newtitle,newstart,newend,newallday) {
				EventsModel.addEvent(newtitle,newstart,newend,newallday);
			};

			/* remove event */
			$scope.remove = function(index) {
				EventsModel.remove(index);
			};

			/* Change View */
			$scope.changeView = function(view,calendar) {
				calendar.fullCalendar('changeView',view);
			};

			$scope.renderCalender = function(calendar) {
				if (calendar) {
					calendar.fullCalendar('render');
				}
			};
		};
	}
]);