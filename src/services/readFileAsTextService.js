/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Team Popcorn <teampopcornberlin@gmail.com>
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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * Read a file object as text
 *
 * @param {File} file The file object to get contents from
 * @returns {Promise<String>}
 */
export const readFileAsText = (file) => {
	const fileReader = new FileReader()

	return new Promise((resolve, reject) => {
		fileReader.onload = () => {
			resolve(fileReader.result)
		}
		fileReader.onerror = (e) => {
			reject(e)
		}

		fileReader.readAsText(file)
	})
}
