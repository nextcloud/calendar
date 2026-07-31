/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { setActivePinia, createPinia } from 'pinia'
import { syncMasterParticipantsOntoFutureExceptions } from '../../../../src/store/calendarObjectInstance.js'

describe('store/calendarObjectInstance syncMasterParticipantsOntoFutureExceptions', () => {

	beforeEach(() => {
		setActivePinia(createPinia())
	})

	const makeProperty = (tag, id) => {
		const property = { tag, id }
		property.clone = () => ({ ...property, cloned: true })
		return property
	}

	const makeException = (recurrenceId) => ({
		recurrenceId,
		deleted: [],
		added: [],
		deleteAllProperties(name) {
			this.deleted.push(name)
		},
		addProperty(property) {
			this.added.push(property)
		},
	})

	const makeMaster = ({ attendees, organizer, exceptions }) => ({
		isMasterItem: () => true,
		getAttendeeList: () => attendees,
		getFirstProperty: (name) => (name === 'ORGANIZER' ? organizer : null),
		recurrenceManager: {
			getRecurrenceExceptionList: () => exceptions,
		},
	})

	const makeEventComponent = (master, referenceRecurrenceId) => ({
		isExactForkOfPrimary: true,
		primaryItem: master,
		getReferenceRecurrenceId: () => referenceRecurrenceId,
	})

	it('does nothing when the component is not an exact fork of its primary', () => {
		const exception = makeException({ compare: () => 0 })
		const master = makeMaster({ attendees: [makeProperty('ATTENDEE', 'a')], organizer: makeProperty('ORGANIZER', 'o'), exceptions: [exception] })
		const eventComponent = makeEventComponent(master, { compare: () => 0 })
		eventComponent.isExactForkOfPrimary = false

		syncMasterParticipantsOntoFutureExceptions(eventComponent)

		expect(exception.deleted).toEqual([])
		expect(exception.added).toEqual([])
	})

	it('does nothing when the primary item is not the master', () => {
		const exception = makeException({})
		const master = makeMaster({ attendees: [], organizer: null, exceptions: [exception] })
		master.isMasterItem = () => false
		const eventComponent = makeEventComponent(master, { compare: () => 0 })

		syncMasterParticipantsOntoFutureExceptions(eventComponent)

		expect(exception.deleted).toEqual([])
		expect(exception.added).toEqual([])
	})

	it('overwrites attendees and organizer on current-and-future exceptions only', () => {
		// ref.compare(exceptionId): +1 when ref is after the exception (past, skipped),
		// 0 when equal, -1 when ref is before it (future). Filter keeps <= 0.
		const ref = { compare: (recurrenceId) => recurrenceId.cmp }
		const past = makeException({ cmp: 1 })
		const current = makeException({ cmp: 0 })
		const future = makeException({ cmp: -1 })
		const attendees = [makeProperty('ATTENDEE', 'a1'), makeProperty('ATTENDEE', 'a2')]
		const organizer = makeProperty('ORGANIZER', 'o')
		const master = makeMaster({ attendees, organizer, exceptions: [past, current, future] })
		const eventComponent = makeEventComponent(master, ref)

		syncMasterParticipantsOntoFutureExceptions(eventComponent)

		expect(past.deleted).toEqual([])
		expect(past.added).toEqual([])

		for (const exception of [current, future]) {
			expect(exception.deleted).toEqual(['ATTENDEE', 'ORGANIZER'])
			expect(exception.added.map((p) => p.id)).toEqual(['a1', 'a2', 'o'])
			expect(exception.added.every((p) => p.cloned)).toBe(true)
		}
	})

	it('overwrites only attendees when the master has no organizer', () => {
		const ref = { compare: () => 0 }
		const exception = makeException({})
		const attendees = [makeProperty('ATTENDEE', 'a1')]
		const master = makeMaster({ attendees, organizer: null, exceptions: [exception] })
		const eventComponent = makeEventComponent(master, ref)

		syncMasterParticipantsOntoFutureExceptions(eventComponent)

		expect(exception.deleted).toEqual(['ATTENDEE'])
		expect(exception.added.map((p) => p.id)).toEqual(['a1'])
	})
})
