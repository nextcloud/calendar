/**
 * @copyright Copyright (c) 2019 Team Popcorn <teampopcornberlin@gmail.com>
 *
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Team Popcorn <teampopcornberlin@gmail.com>
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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
import { defineStore } from 'pinia'

export default defineStore('importFiles', {
	state: () => {
		return {
			lastFileInsertId: -1,
			importFiles: [],
			importFilesById: {},
			importCalendarRelation: {},
		}
	},
	actions: {
		/**
		 * Adds a file to the state
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.contents Contents of file
		 * @param {number} data.lastModified Timestamp of last modification
		 * @param {string} data.name Name of file
		 * @param {AbstractParser} data.parser The parser
		 * @param {number} data.size Size of file
		 * @param {string} data.type mime-type of file
		 */
		addFile({ contents, lastModified, name, parser, size, type }) {
			const file = {
				id: ++this.lastFileInsertId,
				contents,
				lastModified,
				name,
				parser,
				size,
				type,
			}

			this.importFiles.push(file)
			this.importFilesById[file.id] = file
		},

		/**
		 * Removes all files from state
		 */
		removeAllFiles() {
			this.importFiles = []
			this.importFilesById = {}
			this.importCalendarRelation = {}
		},
	},
})
