/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Default } from './PropertySelect.story'

import { expect, test } from '@playwright/test'

test('renders editable', async ({ mount }) => {
	const propModel = {
		readableName: 'Status',
		icon: 'Check',
		options: [
			{ value: 'CONFIRMED', label: 'Confirmed' },
			{ value: 'TENTATIVE', label: 'Tentative' },
			{ value: 'CANCELLED', label: 'Canceled' },
		],
		multiple: false,
		info: 'Confirmation about the overall status of the event.',
		defaultValue: 'CONFIRMED',
	}
	const component = await mount<typeof Default>('components/Editor/Properties/PropertySelect/Default', {
		propModel,
	})

	await expect(component).toHaveScreenshot()
})
