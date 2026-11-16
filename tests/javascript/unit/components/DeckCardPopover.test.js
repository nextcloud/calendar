/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DeckCardPopover from '@/components/DeckCardPopover.vue'

vi.mock('@nextcloud/router', async (importOriginal) => ({
	...(await importOriginal()),
	generateUrl: vi.fn((url, params) => url.replace(/{(\w+)}/g, (_, key) => params[key])),
}))

/**
 * @param {object} card Properties to override on the card
 */
function mountPopover(card = {}) {
	return mount(DeckCardPopover, {
		props: {
			deckCard: {
				board: { id: 12, title: 'Website relaunch', color: '0082c9' },
				card: {
					id: 34,
					title: 'Prepare release notes',
					description: 'Collect the changes',
					duedate: '2026-11-18T10:00:00+00:00',
					labels: [{ title: 'Later', color: 'F1DB50' }, { title: 'Urgent', color: '1A1A1A' }],
					assignedUsers: [{ participant: { uid: 'alice', displayname: 'Alice' } }],
					...card,
				},
			},
		},
	})
}

describe('components/DeckCardPopover', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
	})

	it('shows the card details', () => {
		const wrapper = mountPopover()

		expect(wrapper.text()).toContain('Website relaunch')
		expect(wrapper.text()).toContain('Prepare release notes')
		expect(wrapper.text()).toContain('Collect the changes')
		expect(wrapper.text()).toContain('2026')

		const labels = wrapper.findAll('.deck-card-popover__label')
		expect(labels.map((label) => label.text())).toEqual(['Later', 'Urgent'])
		expect(labels[0].attributes('style')).toContain('color: rgb(0, 0, 0)')
		expect(labels[1].attributes('style')).toContain('color: rgb(250, 250, 250)')
		expect(wrapper.findAll('.deck-card-popover__assignees li')).toHaveLength(1)
	})

	it('hides empty details', () => {
		const wrapper = mountPopover({ description: '', duedate: null, labels: [], assignedUsers: [] })

		expect(wrapper.findAll('.deck-card-popover__row')).toHaveLength(0)
	})

	it('links to the board and the card in Deck', () => {
		const wrapper = mountPopover()

		const links = wrapper.findAll('.deck-card-popover__footer a')
		expect(links.map((link) => [link.text(), link.attributes('href')])).toEqual([
			['Show board', '/apps/deck/board/12'],
			['Edit', '/apps/deck/card/34'],
		])
	})

	it('emits close', async () => {
		const wrapper = mountPopover()

		await wrapper.get('.deck-card-popover__top-actions button').trigger('click')

		expect(wrapper.emitted('close')).toHaveLength(1)
	})

	it('emits close on escape', async () => {
		const wrapper = mountPopover()

		await wrapper.trigger('keydown', { key: 'Escape' })

		expect(wrapper.emitted('close')).toHaveLength(1)
	})
})
