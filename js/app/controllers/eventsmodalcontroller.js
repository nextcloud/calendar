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
app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'Model',
	function ($scope,$routeParams,Restangular,CalendarModel,TimezoneModel,EventsModel,Model) {

		$scope.route = $routeParams;
		var id = $scope.route.id;
		$scope.calendars = CalendarModel.getAll();
		var eventResource = Restangular.one('calendars', id).one('events');

		// Initiates all models required to create a new calendar event
		$scope.summary = '';
		$scope.dtstart = '';
		$scope.dtend = '';
		$scope.locaton = '';
		$scope.categories = '';
		$scope.description = '';

		$scope.create = function() {
			var newevent = {
				"uid" : Model.uidgen,
				"summary" : $scope.summary,
				"dtstart" : $scope.dtstart,
				"dtend" : $scope.dtend,
				"description" : $scope.description,
				"location" : $scope.location,
				"categories" : $scope.categories
				//"last-modified" : $scope.lastmodified
				//"vtimezone" : TimezoneModel.getAll()
			};
			eventResource.post().then(function (newevent) {
				EventsModel.create(newevent);
			});
		};
	}
]);