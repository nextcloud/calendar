/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineStore } from 'pinia'
import Vue from 'vue'

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

			// TODO: use this.importFiles.push(file) directly in Vue 3 (reactive by default)
			this.importFiles = [...this.importFiles, file]
			/// TODO this.importFilesById[file.id] = file
			Vue.set(this.importFilesById, file.id, file)
		},

		/**
		 * Sets a calendar for the file
		 *
		 * @param {object} data The destructuring object
		 * @param {number} data.fileId Id of file to select calendar for
		 * @param {string} data.calendarId Id of calendar to import file into
		 */
		setCalendarForFileId({ fileId, calendarId }) {
			// TODO: remove Vue.set when migrating to Vue 3 (reactive by default)
			Vue.set(this.importCalendarRelation, fileId, calendarId)
		},

		/**
		 * Removes all files from state
		 */
		removeAllFiles() {
			/// TODO this.importFiles = []
			/// TODO this.importFilesById = {}
			/// TODO this.importCalendarRelation = {}

			Vue.set(this, 'importFiles', [])
			Vue.set(this, 'importFilesById', {})
			Vue.set(this, 'importCalendarRelation', {})
		},
	},
})
