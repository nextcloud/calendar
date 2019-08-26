/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { linkTo } from 'nextcloud-router'

/**
 *
 * @param {string} key Key to query for
 * @param {Type} Type Force casting value to Number, String, Bool, etc.
 * @returns {mixed}
 */
export const getConfigValueFromHiddenInput = (key, Type = null) => {
	const elem = document.getElementById('config-' + key)
	if (!elem) {
		return
	}

	if (Type) {
		return new Type(elem.value).valueOf()
	}
	return elem.value
}

export const getLinkToConfig = key => ([
	linkTo('calendar', 'index.php'),
	'v1/config',
	key
].join('/'))
