/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
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
import Vue from 'vue'

const state = {
	contacts: [],
	contactByEMail: {},
}

const mutations = {

	/**
	 * Append multiple contacts to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object[]} data.contacts List of contacts to add
	 */
	appendContacts(state, { contacts = [] }) {
		for (const contact of contacts) {
			if (state.contacts.indexOf(contact) === -1) {
				state.contacts.push(contact)
			}

			for (const email of contact.emails) {
				Vue.set(state.contactByEMail, email, contact)
			}
		}
	},

	/**
	 * Append a single contact to the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object} data.contact The contact to append to the store
	 */
	appendContact(state, { contact }) {
		if (state.contacts.indexOf(contact) === -1) {
			state.contacts.push(contact)
		}

		for (const email of contact.emails) {
			Vue.set(state.contactByEMail, email, contact)
		}
	},

	/**
	 * Removes a single contact from the store
	 *
	 * @param {Object} state The store data
	 * @param {Object} data The destructuring object
	 * @param {Object} data.contact The contact to remove from the store
	 */
	removeContact(state, { contact }) {
		for (const email of contact.email) {
			if (state.contactByEMail[email] === contact) {
				Vue.delete(state.contactByEMail, email)
			}
		}

		const index = state.contacts.indexOf(contact)
		if (index !== -1) {
			state.contacts.splice(index, 1)
		}
	},
}

const getters = {}

const actions = {}

export default { state, mutations, getters, actions }
