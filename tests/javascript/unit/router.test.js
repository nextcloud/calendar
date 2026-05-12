/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import router from '@/router.js'

vi.mock('@nextcloud/router', () => ({
	generateUrl: (path) => '/' + path,
	getRootUrl: () => '',
}))

vi.mock('@nextcloud/initial-state', () => ({
	loadState: vi.fn().mockImplementation((app, key) => {
		if (key === 'initial_view') {
			return 'dayGridMonth'
		}

		if (key === 'skip_popover') {
			return false
		}

		throw new Error(`Unexpected loadState call: ${app}/${key}`)
	}),
}))

vi.mock('@/views/Calendar.vue', () => ({ default: { template: '<div/>' } }))
vi.mock('@/views/EditFull.vue', () => ({ default: { template: '<div/>' } }))
vi.mock('@/views/EditSimple.vue', () => ({ default: { template: '<div/>' } }))

describe('router redirect test suite', () => {
	beforeEach(() => {
		// Simulate a large screen so getPreferredEditorRoute() returns 'popover'
		// (jsdom defaults window.innerWidth to 0, which would force 'full' unconditionally)
		window.innerWidth = 1920
	})

	it('redirects / to the initial view', async () => {
		await router.push('/')
		expect(router.currentRoute.value.path).toBe('/dayGridMonth/now')
	})

	it('redirects /p/:tokens to the initial view with the real token', async () => {
		await router.push('/p/e9NifA4gGmfHJo54')
		expect(router.currentRoute.value.path).toBe('/p/e9NifA4gGmfHJo54/dayGridMonth/now')
	})

	it('redirects /public/:tokens to /p/:tokens with the real token', async () => {
		await router.push('/public/e9NifA4gGmfHJo54')
		expect(router.currentRoute.value.path).toBe('/p/e9NifA4gGmfHJo54/dayGridMonth/now')
	})

	it('redirects /embed/:tokens to the initial view with the real token', async () => {
		await router.push('/embed/e9NifA4gGmfHJo54')
		expect(router.currentRoute.value.path).toBe('/embed/e9NifA4gGmfHJo54/dayGridMonth/now')
	})

	it('redirects /edit/:object with the real object id', async () => {
		await router.push('/edit/someObjectId')
		expect(router.currentRoute.value.path).toBe('/dayGridMonth/now/edit/popover/someObjectId/next')
	})

	it('redirects /edit/:object/:recurrenceId with the real object id and recurrence id', async () => {
		await router.push('/edit/someObjectId/20260512T100000')
		expect(router.currentRoute.value.path).toBe('/dayGridMonth/now/edit/popover/someObjectId/20260512T100000')
	})

	it('redirects /new/:allDay/:dtstart/:dtend with the real param values', async () => {
		await router.push('/new/0/2026-05-12/2026-05-13')
		expect(router.currentRoute.value.path).toBe('/dayGridMonth/2026-05-12/new/popover/0/2026-05-12/2026-05-13')
	})
})
