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

app.controller('SettingsController', ['$scope', '$rootScope', 'Restangular', 'CalendarModel','UploadModel', 'DialogModel',
	function ($scope, $rootScope, Restangular, CalendarModel, UploadModel, DialogModel) {

		$scope.files = [];

		// have to use the native HTML call for filereader to work efficiently
		var importinput = document.getElementById('import');
		var reader = new FileReader();

		$scope.upload = function () {
			UploadModel.upload();
			$scope.files = [];
		};

		$rootScope.$on('fileAdded', function (e, call) {
			$scope.files.push(call);
			$scope.$apply();
			if ($scope.files.length > 0) {
				var file = importinput.files[0];
				reader.onload = function(e) {
					$scope.filescontent = reader.result;
				};
				reader.readAsText(file);
				DialogModel.initsmall('#importdialog');
				DialogModel.open('#importdialog');
			}
			$scope.$digest(); // Shouldn't digest reset scope for it to be implemented again and again?
		});

		$scope.import = function (id) {
			Restangular.one('calendars', id).withHttpConfig({transformRequest: angular.identity}).customPOST(
				$scope.filescontent, // Replace this by the string to be posted.
				'import',
				undefined,
				{
					'Content-Type': 'text/calendar'
				}
			).then( function () {

			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');

		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var firstdayResource = Restangular.one('firstDay');
		firstdayResource.get().then(function (firstdayobject) {
			$scope.selectedday = firstdayobject.value;
		}, function(response) {
			OC.Notification.show(t('calendar', response.data.message));
		});

		var timeformatResource = Restangular.one('timeFormat');
		timeformatResource.get().then(function (timeFormatobject) {
			$scope.selectedtime = timeFormatobject.value;
		}, function (response) {
			OC.Notification.show(t('calendar', response.data.message));

		});

		// Time Format Dropdown
		$scope.timeformatSelect = [
			{ time: t('calendar', '24h'), val: '24' },
			{ time: t('calendar', '12h'), val: 'ampm' }
		];

		// First Day Dropdown
		$scope.firstdaySelect = [
			{ day: t('calendar', 'Monday'), val: 'mo' },
			{ day: t('calendar', 'Sunday'), val: 'su' },
			{ day: t('calendar', 'Saturday'), val: 'sa' }
		];

		//to send a patch to add a hidden event again
		$scope.enableCalendar = function (id) {
			Restangular.one('calendars', id).patch({ 'components' : {'vevent' : true }});
		};

		// Changing the first day
		$scope.changefirstday = function (firstday) {
			firstdayResource.post(firstday.val).then(function (response) {
				OC.Notification.show(t('calendar', response.message));
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
			CalendarModel.pushfirstday(firstday.val);
		};

		// Changing the time format
		$scope.changetimeformat = function (timeformat) {
			timeformatResource.post(timeformat.val).then(function (response) {
				OC.Notification.show(t('calendar', response.message));
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};
	}
]);
