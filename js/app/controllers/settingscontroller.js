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

app.controller('SettingsController', ['$scope','Restangular','$routeParams','TimezoneModel',
	function ($scope,Restangular,$routeParams,TimezoneModel) {

    // In case, routes are need.
    $scope.route = $routeParams;
    $scope.timezones = TimezoneModel.getAll();
    var calendarResource = Restangular.all('v1/timezones');

    // Gets All Calendar Timezones.
    calendarResource.getList().then(function (timezones) {
      TimezoneModel.addAll(timezones);
    });

    console.log($scope.timezones);

    // Time Format Dropdown
    $scope.timeformatSelect = [
      { time : t('calendar', '24h'), val : '24' },
      { time : t('calendar' , '12h'), val : 'ampm' }
    ];

    // First Day Dropdown
    $scope.firstdaySelect = [
      { day : t('calendar', 'Monday'), val : 'mo' },
      { day : t('calendar', 'Sunday'), val : 'su' },
      { day : t('calendar', 'Saturday'), val : 'sa' }
    ];

    // Changing the first day
    $scope.changefirstday = function (firstday) {
    };

    // Creating Timezone, not yet implemented Server Side.
    $scope.create = function () {
      calendarResource.post().then(function (newtimezone) {
        TimezoneModel.add(newtimezone);
      });
    };

    // Deleting Timezone, not yet implemented Server Side.
    $scope.delete = function (timezoneId) {
      var timezone = TimezoneModel.get(timezoneId);
      timezone.remove().then(function () {
        TimezoneModel.remove(timezoneId);
      });
    };
	}
]);
