/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import Vue from 'vue'

const state = {
	contacts: [],
	contactByEMail: {},
}

const mutations = {

	/**
	 * Append a single contact to the store
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.contact The contact to append to the store
	 */
	appendContact(state, { contact }) {
		if (state.contacts.indexOf(contact) === -1) {
			state.contacts.push(contact)
		}

		for (const email of contact.emails) {
			// In the unlikely case that multiple contacts
			// share the same email address, we will just follow
			// first come, first served.
			if (state.contactByEMail[email] === undefined) {
				Vue.set(state.contactByEMail, email, contact)
			}
		}
	},

	/**
	 * Removes a single contact from the store
	 *
	 * @param {object} state The store data
	 * @param {object} data The destructuring object
	 * @param {object} data.contact The contact to remove from the store
	 */
	removeContact(state, { contact }) {
		for (const email of contact.emails) {
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
