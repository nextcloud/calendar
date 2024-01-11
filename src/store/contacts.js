/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineStore } from 'pinia'
import Vue from 'vue'

export default defineStore('contacts', {
	state: () => {
		return {
			contacts: [],
			contactByEmail: {},
		}
	},
	actions: {
		/**
		 * Append a single contact to the store
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.contact The contact to append to the store
		 */
		appendContact({ contact }) {
			if (this.contacts.indexOf(contact) === -1) {
				this.contacts.push(contact)
			}

			for (const email of contact.emails) {
				// In the unlikely case that multiple contacts
				// share the same email address, we will just follow
				// first come, first served.
				if (this.contactByEmail[email] === undefined) {
					/// TODO this.contactByEmail[email] = contact
					Vue.set(this.contactByEmail, email, contact)
				}
			}
		},

		/**
		 * Removes a single contact from the store
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.contact The contact to remove from the store
		 */
		removeContact({ contact }) {
			for (const email of contact.emails) {
				if (this.contactByEmail[email] === contact) {
					delete this.contactByEmail[email]
				}
			}

			const index = this.contacts.indexOf(contact)
			if (index !== -1) {
				this.contacts.splice(index, 1)
			}
		},
	},
})
