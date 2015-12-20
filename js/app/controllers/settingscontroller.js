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

/**
 * Controller: SettingController
 * Description: Takes care of the Calendar Settings.
 */

app.controller('SettingsController', ['$scope', '$rootScope', 'CalendarService', 'VEventService', 'DialogModel',
	function ($scope, $rootScope, CalendarService, VEventService, DialogModel) {
		'use strict';

		$scope.settingsCalDavLink = OC.linkToRemote('caldav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('caldav') + '/principals/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';

		// have to use the native HTML call for filereader to work efficiently

		var reader = new FileReader();

		$('#import').on('change', function () {
			$scope.calendarAdded(this);
		});

		$scope.calendarAdded = function (elem) {
			$scope.files = elem.files;
			$scope.$apply();
			DialogModel.initsmall('#importdialog');
			DialogModel.open('#importdialog');
		};

		$scope.import = function (file) {
			var reader = new FileReader();
			file.isImporting = true;

			reader.onload = function() {
				/*Restangular.one('calendars', file.importToCalendar).withHttpConfig({transformRequest: angular.identity}).customPOST(
						reader.result,
						'import',
						undefined,
						{
							'Content-Type': 'text/calendar'
						}
				).then( function () {
					file.done = true;
				}, function (response) {
					OC.Notification.show(t('calendar', response.data.message));
				});*/
			};

			reader.readAsText(file);
		};

		//to send a patch to add a hidden event again
		$scope.enableCalendar = function (id) {
			//Restangular.one('calendars', id).patch({ 'components' : {'vevent' : true }});
		};
	}
]);
