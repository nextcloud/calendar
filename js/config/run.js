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

app.run(['$document', '$rootScope', '$window', 'isPublic',
	function ($document, $rootScope, $window, isPublic) {
		'use strict';

		const origin = $window.location.origin;
		$rootScope.root = origin + OC.linkTo('calendar', 'index.php') + '/';
		$rootScope.baseUrl = $rootScope.root + 'v1/';

		try {
			if (!isPublic) {
				const webcalHandler = $rootScope.root + '#subscribe_to_webcal?url=%s';
				navigator.registerProtocolHandler('webcal', webcalHandler, 'Nextcloud calendar');
			}
		} catch(e) {
			console.log(e);
		}

		$document.click(function (event) {
			$rootScope.$broadcast('documentClicked', event);
		});
	}
]);
