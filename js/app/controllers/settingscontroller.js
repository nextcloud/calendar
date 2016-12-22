/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

app.controller('SettingsController', ['$scope', '$uibModal', '$timeout', 'SettingsService', 'fc', 'isFirstRun', 'settings',
	function ($scope, $uibModal, $timeout, SettingsService, fc, isFirstRun, settings) {
		'use strict';

		$scope.settingsCalDavLink = OC.linkToRemote('dav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('dav') + '/principals/users/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';
		$scope.skipPopover = settings.skipPopover ? 'yes' : 'no';
		$scope.settingsShowWeekNr = settings.showWeekNr ? 'yes' : 'no';

		$timeout(() => {
			if (isFirstRun) {
				angular.element('.settings-button').click();
				angular.element('#import-button-overlay').tooltip({
					animation: true,
					placement: 'bottom',
					title: t('calendar', 'How about getting started by importing some calendars?')
				});
				$timeout(() => {
					angular.element('#import-button-overlay').tooltip('toggle');
				}, 500);
				$timeout(() => {
					angular.element('#import-button-overlay').tooltip('toggle');
				}, 10500);
				SettingsService.passedFirstRun();
			}
		}, 1500);

		angular.element('#import').on('change', function () {
			var filesArray = [];
			for (var i=0; i < this.files.length; i++) {
				filesArray.push(this.files[i]);
			}

			if (filesArray.length > 0) {
				$uibModal.open({
					templateUrl: 'import.html',
					controller: 'ImportController',
					windowClass: 'import',
					backdropClass: 'import-backdrop',
					keyboard: false,
					appendTo: angular.element('#importpopover-container'),
					resolve: {
						files: function () {
							return filesArray;
						}
					},
					scope: $scope
				});
			}

			angular.element('#import').val(null);
		});

		$scope.updateSkipPopover = function() {
			const newValue = $scope.skipPopover;
			settings.skipPopover = (newValue === 'yes');
			SettingsService.setSkipPopover(newValue);
		};

		$scope.updateShowWeekNr = function() {
			const newValue = $scope.settingsShowWeekNr;
			settings.showWeekNr = (newValue === 'yes');
			SettingsService.setShowWeekNr(newValue);
			if (fc.elm) {
				fc.elm.fullCalendar('option', 'weekNumbers', (newValue === 'yes'));
			}
		};
	}
]);
