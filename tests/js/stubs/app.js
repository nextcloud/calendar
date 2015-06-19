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

window.app = angular.module('Calendar', [
	'ngMock',
	'restangular',
	'ngRoute'
]).config(['RestangularProvider',
	function (RestangularProvider) {
		RestangularProvider.setBaseUrl('/v1/');
	}
]);

window.OC = {

    linkToRemote: function (url) {
        'use strict';

        return '/base' + url;
    }

};

escapeHTML = function (string) {
	return;
}

oc_current_user = 'user';