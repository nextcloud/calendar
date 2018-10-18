/**
 * @copyright Copyright (c) 2018 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import DavClient from 'cdav-library'

function xhrProvider() {
	var headers = {
		'X-Requested-With': 'XMLHttpRequest',
		'requesttoken': OC.requestToken
	}
	var xhr = new XMLHttpRequest()
	var oldOpen = xhr.open

	// override open() method to add headers
	xhr.open = function() {
		var result = oldOpen.apply(this, arguments)
		for (let name in headers) {
			xhr.setRequestHeader(name, headers[name])
		}
		return result
	}
	OC.registerXHRForErrorProcessing(xhr)
	return xhr
}

export default new DavClient({
	rootUrl: OC.linkToRemote('dav')
}, xhrProvider)
