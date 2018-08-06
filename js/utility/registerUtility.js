/**
 * Calendar App
 *
 * @author Thomas Citharel
 * @copyright 2016 Thomas Citharel <tcit@tcit.fr>
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

'use strict';

let register = (function () {

	OCA.Files.fileActions.registerAction({
		name: 'View',
		mime: 'text/calendar',
		displayName: t('calendar', 'Calendar'),
		actionHandler: function(filename, context) {
			let path = $('#fileList').find('[data-file="'+filename+'"]').data('path');
			path = path.substring(1);
			window.location = OC.generateUrl('apps/calendar/#/import/{filename}', {filename: encodeURIComponent(path + '/' + filename)});
		},
		permissions: OC.PERMISSION_READ,
		icon: function () {
			return OC.imagePath('core', 'actions/view');
		}
	});
	OCA.Files.fileActions.setDefault('text/calendar', 'View');
})();
