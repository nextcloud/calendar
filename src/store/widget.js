/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineStore } from 'pinia'

export default defineStore('widget', {
	state: () => {
		return {
			widgetView: 'dayGridMonth',
			widgetDate: 'now',
			widgetEventDetailsOpen: false,
			widgetEventDetails: {},
			widgetRef: undefined,
		}
	},
	actions: {
		setWidgetView({ viewName }) {
			this.widgetView = viewName
		},

		setWidgetDate({ widgetDate }) {
			this.widgetDate = widgetDate
		},

		setWidgetRef({ widgetRef }) {
			this.widgetRef = widgetRef
		},

		setSelectedEvent({ object, recurrenceId }) {
			this.widgetEventDetailsOpen = true
			this.widgetEventDetails = {
				object,
				recurrenceId,
			}
		},

		closeWidgetEventDetails() {
			this.widgetEventDetailsOpen = false
		},
	},
})
