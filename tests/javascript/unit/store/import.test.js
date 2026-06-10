/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { createPinia, setActivePinia } from 'pinia'
import useImportStore from '../../../../src/store/import.ts'
import { importService } from '../../../../src/services/importService'

const { calendarsStoreMock, principalsStoreMock } = vi.hoisted(() => ({
	calendarsStoreMock: {
		getCalendarById: vi.fn(),
		addCalendarMutation: vi.fn(),
	},
	principalsStoreMock: {
		getCurrentUserPrincipal: { url: 'http://localhost/principal/admin' },
	},
}))

vi.mock('../../../../src/services/importService', () => ({
	importService: { import: vi.fn() },
}))
vi.mock('../../../../src/services/caldavService.js', () => ({
	createCalendar: vi.fn(),
}))
vi.mock('../../../../src/models/calendar.js', () => ({
	mapDavCollectionToCalendar: vi.fn(),
}))
vi.mock('../../../../src/store/calendars.js', () => ({
	default: () => calendarsStoreMock,
}))
vi.mock('../../../../src/store/principals.js', () => ({
	default: () => principalsStoreMock,
}))

/**
 * Build a queueable import file payload (the shape `addFile` expects).
 *
 * @param {object} overrides Properties overriding the defaults
 * @return {object} A file payload for `addFile`
 */
function makeFilePayload(overrides = {}) {
	return {
		contents: 'BEGIN:VCALENDAR...',
		lastModified: 1590151056,
		name: 'file.ics',
		parser: {},
		size: 1337,
		type: 'text/calendar',
		...overrides,
	}
}

describe('store/import test suite', () => {
	beforeEach(() => {
		importService.import.mockReset()
		calendarsStoreMock.getCalendarById.mockReset()
		calendarsStoreMock.addCalendarMutation.mockReset()
		setActivePinia(createPinia())
	})

	it('should provide a default state', () => {
		const store = useImportStore()

		expect(store.files).toEqual([])
		expect(store.sessions).toEqual({})
		expect(store.order).toEqual([])
		expect(store.lastFileInsertId).toBe(-1)
		expect(store.stage).toBe('idle')
		expect(store.running).toBe(false)
		expect(store.lastError).toBe(null)
		expect(store.activeSession).toBe(null)
		expect(store.totals).toEqual({
			discovered: 0,
			processed: 0,
			created: 0,
			updated: 0,
			exists: 0,
			error: 0,
		})
	})

	it('should add files with an incrementing id and default per-file options', () => {
		const store = useImportStore()

		store.addFile(makeFilePayload({ name: 'ical.ics', type: 'text/calendar' }))
		store.addFile(makeFilePayload({ name: 'jcal.json', type: 'application/calendar+json' }))
		store.addFile(makeFilePayload({ name: 'xcal.xml', type: 'application/calendar+xml' }))

		expect(store.lastFileInsertId).toBe(2)
		expect(store.files).toEqual([
			{
				file: { ...makeFilePayload({ name: 'ical.ics', type: 'text/calendar' }), id: 0 },
				calendarId: null,
				options: { format: 'ical', supersede: false },
			},
			{
				file: { ...makeFilePayload({ name: 'jcal.json', type: 'application/calendar+json' }), id: 1 },
				calendarId: null,
				options: { format: 'jcal', supersede: false },
			},
			{
				file: { ...makeFilePayload({ name: 'xcal.xml', type: 'application/calendar+xml' }), id: 2 },
				calendarId: null,
				options: { format: 'xcal', supersede: false },
			},
		])
	})

	it('should merge per-file options without dropping untouched keys', () => {
		const store = useImportStore()
		store.addFile(makeFilePayload())

		store.setOptionsForFile({ fileId: 0, options: { supersede: true } })
		expect(store.files[0].options).toEqual({ format: 'ical', supersede: true })

		store.setOptionsForFile({ fileId: 0, options: { format: 'xcal' } })
		expect(store.files[0].options).toEqual({ format: 'xcal', supersede: true })
	})

	it('should ignore option changes for an unknown file id', () => {
		const store = useImportStore()
		store.addFile(makeFilePayload())

		expect(() => store.setOptionsForFile({ fileId: 99, options: { supersede: true } })).not.toThrow()
		expect(store.files[0].options).toEqual({ format: 'ical', supersede: false })
	})

	it('should set the calendar for a queued file and ignore unknown file ids', () => {
		const store = useImportStore()
		store.addFile(makeFilePayload())

		store.setCalendarForFile({ fileId: 0, calendarId: 'CALENDAR-ID-1' })
		expect(store.files[0].calendarId).toBe('CALENDAR-ID-1')

		expect(() => store.setCalendarForFile({ fileId: 99, calendarId: 'CALENDAR-ID-2' })).not.toThrow()
		expect(store.files[0].calendarId).toBe('CALENDAR-ID-1')
	})

	it('should remove all queued files', () => {
		const store = useImportStore()
		store.addFile(makeFilePayload({ name: 'a.ics' }))
		store.addFile(makeFilePayload({ name: 'b.ics' }))

		store.removeAllFiles()

		expect(store.files).toEqual([])
		// The insert id keeps growing so re-added files never collide with prior ones.
		expect(store.lastFileInsertId).toBe(1)
	})

	it('should reset the run state while keeping the queued files', () => {
		const store = useImportStore()
		store.addFile(makeFilePayload())
		store.stage = 'importing'
		store.running = true
		store.lastError = 'boom'
		store.order = [0]
		store.sessions = { 0: { status: 'error' } }

		store.reset()

		expect(store.stage).toBe('idle')
		expect(store.running).toBe(false)
		expect(store.lastError).toBe(null)
		expect(store.order).toEqual([])
		expect(store.sessions).toEqual({})
		// Files are part of the queue, not the run, so they survive a reset.
		expect(store.files).toHaveLength(1)
	})

	it('should aggregate counters across sessions in totals', () => {
		const store = useImportStore()
		store.order = [0, 1]
		store.sessions = {
			0: { counters: { discovered: 2, processed: 2, created: 1, updated: 1, exists: 0, error: 0 } },
			1: { counters: { discovered: 3, processed: 1, created: 0, updated: 0, exists: 1, error: 0 } },
		}

		expect(store.totals).toEqual({
			discovered: 5,
			processed: 3,
			created: 1,
			updated: 1,
			exists: 1,
			error: 0,
		})
	})

	it('should return empty counters and not stream when the queue is empty', async () => {
		const store = useImportStore()

		const totals = await store.startImport()

		expect(importService.import).not.toHaveBeenCalled()
		expect(totals).toEqual({
			discovered: 0,
			processed: 0,
			created: 0,
			updated: 0,
			exists: 0,
			error: 0,
		})
	})

	it('should stream into the selected calendar and aggregate the results', async () => {
		calendarsStoreMock.getCalendarById.mockReturnValue({
			id: 'cal-1',
			url: 'http://localhost/remote.php/dav/calendars/admin/personal/',
			displayName: 'Personal',
		})
		importService.import.mockImplementation(async (request, onData) => {
			onData({ type: 'count', transaction: 't', vevent: 2, vtodo: 0, vjournal: 0 })
			onData({ type: 'object', transaction: 't', identifier: 'a', disposition: 'created', errors: [] })
			onData({ type: 'object', transaction: 't', identifier: 'b', disposition: 'created', errors: [] })
		})

		const store = useImportStore()
		store.addFile(makeFilePayload({ type: 'application/calendar+xml' }))
		store.setCalendarForFile({ fileId: 0, calendarId: 'cal-1' })
		store.setOptionsForFile({ fileId: 0, options: { supersede: true } })

		const totals = await store.startImport()

		expect(importService.import).toHaveBeenCalledTimes(1)
		const [request] = importService.import.mock.calls[0]
		expect(request).toEqual({
			target: 'personal',
			options: { format: 'xcal', validation: 1, errors: 0, supersede: true },
			data: 'BEGIN:VCALENDAR...',
		})

		expect(totals).toEqual({
			discovered: 2,
			processed: 2,
			created: 2,
			updated: 0,
			exists: 0,
			error: 0,
		})
		expect(store.stage).toBe('completed')
		expect(store.running).toBe(false)
		expect(store.sessions[0].status).toBe('completed')
		expect(store.sessions[0].targetDisplayName).toBe('Personal')
		expect(store.sessions[0].targetUri).toBe('personal')
	})

	it('should mark a session as errored when an object fails to import', async () => {
		calendarsStoreMock.getCalendarById.mockReturnValue({
			id: 'cal-1',
			url: 'http://localhost/remote.php/dav/calendars/admin/personal/',
			displayName: 'Personal',
		})
		importService.import.mockImplementation(async (request, onData) => {
			onData({ type: 'count', transaction: 't', vevent: 2, vtodo: 0, vjournal: 0 })
			onData({ type: 'object', transaction: 't', identifier: 'a', disposition: 'created', errors: [] })
			onData({ type: 'object', transaction: 't', identifier: 'b', disposition: 'error', errors: ['nope'] })
		})

		const store = useImportStore()
		store.addFile(makeFilePayload())
		store.setCalendarForFile({ fileId: 0, calendarId: 'cal-1' })

		await store.startImport()

		expect(store.sessions[0].status).toBe('error')
		expect(store.totals.error).toBe(1)
		expect(store.totals.created).toBe(1)
	})

	it('should fail the import when the selected calendar cannot be found', async () => {
		calendarsStoreMock.getCalendarById.mockReturnValue(undefined)

		const store = useImportStore()
		store.addFile(makeFilePayload())
		store.setCalendarForFile({ fileId: 0, calendarId: 'missing' })

		await expect(store.startImport()).rejects.toThrow('Selected calendar not found')
		expect(store.stage).toBe('error')
		expect(store.lastError).toBe('Selected calendar not found')
		expect(store.running).toBe(false)
	})
})
