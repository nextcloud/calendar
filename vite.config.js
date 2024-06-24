/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import path from 'path'
import { createAppConfig } from '@nextcloud/vite-config'

export default createAppConfig({
	main: path.join(__dirname, 'src', 'main.js'),
	dashboard: path.join(__dirname, 'src', 'dashboard.js'),
	reference: path.join(__dirname, 'src', 'reference.js'),
	'appointments-booking': path.join(__dirname, 'src', 'appointments/main-booking.js'),
	'appointments-confirmation': path.join(__dirname, 'src', 'appointments/main-confirmation.js'),
	'appointments-conflict': path.join(__dirname, 'src', 'appointments/main-conflict.js'),
	'appointments-overview': path.join(__dirname, 'src', 'appointments/main-overview.js'),
}, {
	// Move all css to a single chunk (calendar-style.css)
	inlineCSS: false,
	config: {
		build: {
			cssCodeSplit: false,
		},
	},
})
