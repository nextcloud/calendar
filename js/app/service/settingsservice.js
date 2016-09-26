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

app.service('SettingsService', ['$rootScope', '$http', function($rootScope, $http) {
	'use strict';

	this.getView = function() {
		return $http({
			method: 'GET',
			url: $rootScope.baseUrl + 'config',
			params: {key: 'view'}
		}).then(function(response) {
			return response.data.value;
		});
	};

	this.setView = function(view) {
		return $http({
			method: 'POST',
			url: $rootScope.baseUrl + 'config',
			data: {
				key: 'view',
				value: view
			}
		}).then(function() {
			return true;
		});
	};

	this.getSkipPopover = function() {
		return $http({
			method: 'GET',
			url: $rootScope.baseUrl + 'config',
			params: {key: 'skipPopover'}
		}).then(function(response) {
			return response.data.value;
		});
	};

	this.setSkipPopover = function(value) {
		return $http({
			method: 'POST',
			url: $rootScope.baseUrl + 'config',
			data: {
				key: 'skipPopover',
				value: value
			}
		}).then(function() {
			return true;
		});
	};

	this.getShowWeekNr = function() {
		return $http({
			method: 'GET',
			url: $rootScope.baseUrl + 'config',
			params: {key: 'showWeekNr'}
		}).then(function(response) {
			return response.data.value;
		});
	};

	this.setShowWeekNr = function(value) {
		return $http({
			method: 'POST',
			url: $rootScope.baseUrl + 'config',
			data: {
				key: 'showWeekNr',
				value: value
			}
		}).then(function() {
			return true;
		});
	};
}]);
