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
		var calendarid = $scope.route.calendarId; 
		$scope.calendars = CalendarModel.getAll();

		/* All Date Objects */
		var date = new Date();
		var currentdate = date.getDate();
		var currentmonth = date.getMonth();
		var currentyear = date.getFullYear();

		var calendarResource = Restangular.one('calendars/' + calendarid + '/events');

		calendarResource.getList().then(function(calendarid) {
			EventsModel.addAll(calendarid);
		});
	
		/* event source that contains custom events on the scope */
		$scope.events = [{
			title: 'Birthday Party',
			start: new Date(currentyear, currentmonth, currentdate + 1, 19, 0),
			end: new Date(currentyear, currentmonth, currentdate + 1, 22, 30),
			allDay: false,
			url: 'http://google.com'
		}];

		/* TODO : This shoudl trigger the dialouge box for adding the event. */
		$scope.alertOnEventClick = function(event,allDay,jsEvent,view ){
			$scope.alertMessage = (event.title + ' was clicked ');
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
				start: new Date(currentyear, currentmonth, 28),
				end: new Date(currentyear, currentmonth, 29),
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
				eventClick: $scope.alertOnEventClick
			}
		};

		/* event sources array*/
		$scope.eventSources = [$scope.events];
	}
]);