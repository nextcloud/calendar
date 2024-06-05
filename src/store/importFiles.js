/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import Vue from 'vue'

const state = {
	lastFileInsertId: -1,
	importFiles: [],
	importFilesById: {},
	importCalendarRelation: {},
}

const mutations = {

	/**
	 * Adds a file to the state
	 *
	 * @param {object} state The vuex state
	 * @param {object} data The destructuring object
	 * @param {string} data.contents Contents of file
	 * @param {number} data.lastModified Timestamp of last modification
	 * @param {string} data.name Name of file
	 * @param {AbstractParser} data.parser The parser
	 * @param {number} data.size Size of file
	 * @param {string} data.type mime-type of file
	 */
	addFile(state, { contents, lastModified, name, parser, size, type }) {
		const file = {
			id: ++state.lastFileInsertId,
			contents,
			lastModified,
			name,
			parser,
			size,
			type,
		}

		state.importFiles.push(file)
		Vue.set(state.importFilesById, file.id, file)
	},

	/**
	 * Sets a calendar for the file
	 *
	 * @param {object} state The vuex state
	 * @param {object} data The destructuring object
	 * @param {number} data.fileId Id of file to select calendar for
	 * @param {string} data.calendarId Id of calendar to import file into
	 */
	setCalendarForFileId(state, { fileId, calendarId }) {
		Vue.set(state.importCalendarRelation, fileId, calendarId)
	},

	/**
	 * Removes all files from state
	 *
	 * @param {object} state The vuex state
	 */
	removeAllFiles(state) {
		Vue.set(state, 'importFiles', [])
		Vue.set(state, 'importFilesById', {})
		Vue.set(state, 'importCalendarRelation', {})
	},
}

const getters = {}

const actions = {}

export default { state, mutations, getters, actions }
