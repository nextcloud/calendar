/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineStore } from 'pinia'

export default defineStore('davRestrictions', {
	state: () => {
		return {
			minimumDate: '1970-01-01T00:00:00Z',
			maximumDate: '2037-12-31T23:59:59Z',
		}
	},
	actions: {
		loadDavRestrictionsFromServer({ minimumDate, maximumDate }) {
			this.minimumDate = minimumDate
			this.maximumDate = maximumDate
		},
	},
})
