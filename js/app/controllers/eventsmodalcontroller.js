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


		$scope.create = function() {
			var newevent = {
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