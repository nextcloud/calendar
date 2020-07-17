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

/**
 * Gets the corresponding color for a given Free/Busy type
 *
 * @param {String} type The type of the FreeBusy property
 * @returns {string}
 */
export function getColorForFBType(type = 'BUSY') {
	switch (type) {
	case 'FREE':
		return '#55B85F'

	case 'BUSY-TENTATIVE':
		return '#4C81FF'

	case 'BUSY':
		return '#273A7F'

	case 'BUSY-UNAVAILABLE':
		return '#50347F'

	default:
		return '#DA9CBD'
	}
}
