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

 app.controller('SubscriptionController', ['$scope', '$window','SubscriptionModel', 'CalendarModel', 'EventsModel', 'Restangular',
	function ($scope,$window,SubscriptionModel,CalendarModel,EventsModel,Restangular) {
		
		$scope.subscriptions = SubscriptionModel.getAll();
		$scope.calendars = CalendarModel.getAll();

		$scope.calDAVfieldset = [];
		$scope.calDAVmodel = '';
		$scope.i = []; // Needed for only one CalDAV Input opening.
		
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

		// CalDAV display - hide logic goes here.
		$scope.toggleCalDAV = function ($index,uri,id) {
			$scope.i.push($index);
			$scope.calDAVmodel = OC.linkToRemote('caldav') + '/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/' + escapeHTML(encodeURIComponent(uri));
			for (var i=0; i<$scope.i.length - 1; i++) {
				$scope.calDAVfieldset[i] = false;
			}

			$scope.calDAVfieldset[$index] = true;
			$scope.hidecalDAVfieldset = function ($index) {
				$scope.calDAVfieldset[$index] = false;
			};
		};

		$scope.download = function (id) {
			$window.open('v1/calendars/' + id + '/export');
		};

		// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function(newid) {
			$scope.addEvent(newid); // Switches watch in CalController
		};

	}
]);