/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

			this.importFiles = [...this.importFiles, file]
			this.importFilesById[file.id] = file
		},

		/**
		 * Sets a calendar for the file
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.fileId Id of file to select calendar for
		 * @param {string} data.calendarId Id of calendar to import file into
		 */
		setCalendarForFileId({ fileId, calendarId }) {
			this.importCalendarRelation[fileId] = calendarId
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
