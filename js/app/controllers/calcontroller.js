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

		/* All Date Objects */
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

		var calendarResource = Restangular.one('v1/calendars/' + id + '/events');

		calendarResource.getList().then(function() {
			EventsModel.addAll(id);
		});

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