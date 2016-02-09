/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
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

app.controller('SettingsController', ['$scope', '$uibModal',
	function ($scope, $uibModal) {
		'use strict';

		$scope.settingsCalDavLink = OC.linkToRemote('caldav') + '/';
		$scope.settingsCalDavPrincipalLink = OC.linkToRemote('caldav') + '/principals/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/';

		angular.element('#import').on('change', function () {
			var _this = this;

			if (this.files.length > 0) {
				var modal = $uibModal.open({
					templateUrl: 'import.html',
					controller: 'ImportController',
					windowClass: 'import',
					appendTo: angular.element('#importpopover-container'),
					resolve: {
						files: function () {
							return _this.files;
						}
					},
					scope: $scope
				});

				/*angular.element('#import').attr('disabled', 'disabled');
				modal.result.then(function() {
					console.log('removeAttr called');
					angular.element('#import').removeAttr('disabled', 'disabled');
				});*/
			}

			angular.element('#import').value = '';
		});
	}
]);
