/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Vue from 'vue'
import { createConfig, deleteConfig, updateConfig } from '../services/appointmentConfigService'
import logger from '../utils/logger'

const state = {
	configs: {},
}

const mutations = {
	addInitialConfigs(state, configs) {
		for (const config of configs) {
			Vue.set(state.configs, config.id, config)
		}
	},
	updateConfig(state, { config }) {
		if (!state.configs[config.id]) {
			return
		}

		Vue.set(state.configs, config.id, config.clone())
	},
	addConfig(state, { config }) {
		Vue.set(state.configs, config.id, config)
	},
	deleteConfig(state, { id }) {
		if (!state.configs[id]) {
			return
		}

		Vue.delete(state.configs, id)
	},
}

const getters = {
	allConfigs(state) {
		return Object.values(state.configs)
	},
}

const actions = {
	async updateConfig({ commit }, { config }) {
		try {
			const updatedConfig = await updateConfig(config)
			commit('updateConfig', { config: updatedConfig })
			return updatedConfig
		} catch (error) {
			logger.error('Failed to update config', { error })
			throw error
		}
	},
	async createConfig({ commit }, { config }) {
		try {
			const fullConfig = await createConfig(config)
			commit('addConfig', { config: fullConfig })
			return fullConfig
		} catch (error) {
			logger.error('Failed to create config', { error })
			throw error
		}
	},
	async deleteConfig({ commit }, { id }) {
		try {
			await deleteConfig(id)
			commit('deleteConfig', { id })
		} catch (error) {
			logger.error('Failed to delete config', { error })
			throw error
		}
	},
}

export default { state, mutations, getters, actions }
