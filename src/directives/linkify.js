/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 *
 * @copyright 2019 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 *
 * @license AGPL-3.0-or-later
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
import linkifyStr from 'linkifyjs/string'

/**
 * Linkify the content of text node
 *
 * (This is the shorthand directive syntax for bind and update)
 *
 * @param {Node} el The element the directive is bound to
 * @param {object} binding  An object containing various properties
 */
const linkify = (el, binding) => {
	el.innerHTML = linkifyStr(binding.value, {
		defaultProtocol: 'https',
	})
}

export {
	linkify,
}
