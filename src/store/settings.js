/**
 * @copyright Copyright (c) 2018 Georg Ehrke
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
import axios from 'nextcloud-axios'

const configEndpoint = OC.linkTo('calendar', 'index.php') + '/v1/config'

const state = {
	emailAddress: oca_calendar.emailAddress || '',
	firstRun: oca_calendar.firstRun === 'yes',
	initialView: oca_calendar.initialView || 'month',
	showPopover: oca_calendar.skipPopover === 'no',
	showWeekends: oca_calendar.showWeekends === 'yes',
	showWeekNumbers: oca_calendar.weekNumbers === 'yes',
	timezone: oca_calendar.timezone || 'automatic'
}

const mutations = {
	togglePopoverEnabled(state) {
		state.showPopover = !state.showPopover
	},
	toggleWeekendsEnabled(state) {
		state.showWeekends = !state.showWeekends
	},
	toggleWeekNumberEnabled(state) {
		state.showWeekNumbers = !state.showWeekNumbers
	}
}

const getters = {

}

const actions = {
	async togglePopoverEnabled(context) {
		const newState = !context.state.showPopover
		await axios.post(configEndpoint, {
			key: 'skipPopover',
			value: newState ? 'no' : 'yes'
		}).then((response) => {
			context.commit('togglePopoverEnabled')
		}).catch((error) => {
			throw error
		})
	},
	async toggleWeekendsEnabled(context) {
		const newState = !context.state.showWeekends
		await axios.post(configEndpoint, {
			key: 'showWeekends',
			value: newState ? 'yes' : 'no'
		}).then((response) => {
			context.commit('toggleWeekendsEnabled')
		}).catch((error) => {
			throw error
		})
	},
	async toggleWeekNumberEnabled(context) {
		const newState = !context.state.showWeekends
		await axios.post(configEndpoint, {
			key: 'showWeekNr',
			value: newState ? 'yes' : 'no'
		}).then((response) => {
			context.commit('toggleWeekNumberEnabled')
		}).catch((error) => {
			throw error
		})
	}
}

export default { state, mutations, getters, actions }
