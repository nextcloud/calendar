/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import importFilesStore from '../../../../src/store/importFiles.js'

describe('store/importFiles test suite', () => {

	it('should provide a default state', () => {
		expect(importFilesStore.state).toEqual({
			lastFileInsertId: -1,
			importFiles: [],
			importFilesById: {},
			importCalendarRelation: {},
		})
	})

	it('should provide a mutation to add a file', () => {
		const state = {
			lastFileInsertId: 41,
			importFiles: [],
			importFilesById: {},
		}

		const file1 = {
			contents: 'BEGIN:VCALENDAR...',
			lastModified: 1590151056,
			name: 'file-1.ics',
			parser: {},
			size: 1337,
			type: 'text/calendar',
		}
		const file2 = {
			contents: '{}',
			lastModified: 1590151056,
			name: 'file-2.ics',
			parser: {},
			size: 42,
			type: 'application/json+calendar',
		}

		importFilesStore.mutations.addFile(state, file1)
		importFilesStore.mutations.addFile(state, file2)

		expect(state.importFiles).toEqual([
			{
				...file1,
				id: 42,
			}, {
				...file2,
				id: 43,
			}
		])

		expect(state.importFilesById[42]).toEqual({
			...file1,
			id: 42,
		})
		expect(state.importFilesById[43]).toEqual({
			...file2,
			id: 43,
		})
	})

	it('should provide a mutation to set a calendarId for a file', () => {
		const state = {
			importCalendarRelation: {},
		}

		importFilesStore.mutations.setCalendarForFileId(state, { fileId: 0, calendarId: 'CALENDAR-ID-1' })
		importFilesStore.mutations.setCalendarForFileId(state, { fileId: 42, calendarId: 'CALENDAR-ID-1' })

		expect(state.importCalendarRelation).toEqual({
			0: 'CALENDAR-ID-1',
			42: 'CALENDAR-ID-1',
		})
	})

	it('should provide a mutation to remove all files', () => {
		const file1 = {
			id: 0,
			contents: 'BEGIN:VCALENDAR...',
			lastModified: 1590151056,
			name: 'file-1.ics',
			parser: {},
			size: 1337,
			type: 'text/calendar',
		}
		const file2 = {
			id: 1,
			contents: '{}',
			lastModified: 1590151056,
			name: 'file-2.ics',
			parser: {},
			size: 42,
			type: 'application/json+calendar',
		}

		const state = {
			lastFileInsertId: 1,
			importFiles: [
				file1,
				file2,
			],
			importFilesById: {
				0: file1,
				1: file2,
			},
			importCalendarRelation: {
				0: 'CALENDAR-ID-1',
				1: 'CALENDAR-ID-1',
			},
		}

		importFilesStore.mutations.removeAllFiles(state)

		expect(state).toEqual({
			lastFileInsertId: 1,
			importFiles: [],
			importFilesById: {},
			importCalendarRelation: {},
		})
	})

})
