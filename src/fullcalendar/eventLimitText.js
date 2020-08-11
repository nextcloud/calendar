/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
import { translatePlural as n } from '@nextcloud/l10n'

/**
 * Provide the string when the event limit is hit
 *
 * @param {Object} data Data destructuring object
 * @param {Number} data.num Number of omitted event
 * @returns {string}
 */
export default function({ num }) {
	// TODO: this is broken, because singular and plural are equal
	return n('calendar', '+%n more', '+%n more', num)
}
