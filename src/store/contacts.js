/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { defineStore } from 'pinia'

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
					this.contactByEmail[email] = contact
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
					this.contactByEmail.delete(email)
				}
			}

			const index = this.contacts.indexOf(contact)
			if (index !== -1) {
				this.contacts.splice(index, 1)
			}
		},
	},
})
