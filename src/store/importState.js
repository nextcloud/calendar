/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { IMPORT_STAGE_DEFAULT } from '../models/consts.js'
import { defineStore } from 'pinia'

export default defineStore('importState', {
	state: () => {
		return {
			total: 0,
			accepted: 0,
			denied: 0,
			stage: IMPORT_STAGE_DEFAULT,
		}
	},
	actions: {
		/**
		 * Reset to the default state
		 */
		resetState() {
			this.total = 0
			this.accepted = 0
			this.denied = 0
			this.stage = IMPORT_STAGE_DEFAULT
		},
	},
})
