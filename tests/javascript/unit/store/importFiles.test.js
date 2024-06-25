/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useImportFilesStore from '../../../../src/store/importFiles.js'
import { setActivePinia, createPinia } from 'pinia'

describe('store/importFiles test suite', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('should provide a default state', () => {
		const importFilesStore = useImportFilesStore()

		expect(importFilesStore.$state).toEqual({
			lastFileInsertId: -1,
			importFiles: [],
			importFilesById: {},
			importCalendarRelation: {},
		})
	})

	it('should provide a mutation to add a file', () => {
		const importFilesStore = useImportFilesStore()

		const state = {
			lastFileInsertId: 41,
			importFiles: [],
			importFilesById: {},
		}

		importFilesStore.$state = state

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

		importFilesStore.addFile(file1)
		importFilesStore.addFile(file2)

		expect(importFilesStore.importFiles).toEqual([
			{
				...file1,
				id: 42,
			}, {
				...file2,
				id: 43,
			}
		])

		expect(importFilesStore.importFilesById[42]).toEqual({
			...file1,
			id: 42,
		})
		expect(importFilesStore.importFilesById[43]).toEqual({
			...file2,
			id: 43,
		})
	})

	it('should provide a mutation to set a calendarId for a file', () => {
		const importFilesStore = useImportFilesStore()

		importFilesStore.importCalendarRelation = {}
		importFilesStore.setCalendarForFileId({ fileId: 0, calendarId: 'CALENDAR-ID-1' })
		importFilesStore.setCalendarForFileId({ fileId: 42, calendarId: 'CALENDAR-ID-1' })

		expect(importFilesStore.importCalendarRelation).toEqual({
			0: 'CALENDAR-ID-1',
			42: 'CALENDAR-ID-1',
		})
	})

	it('should provide a mutation to remove all files', () => {
		const importFilesStore = useImportFilesStore()

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

		importFilesStore.$state = state

		importFilesStore.removeAllFiles()

		expect(importFilesStore.$state).toEqual({
			lastFileInsertId: 1,
			importFiles: [],
			importFilesById: {},
			importCalendarRelation: {},
		})
	})

})
