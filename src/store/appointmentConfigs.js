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
import { defineStore } from 'pinia'
import { createConfig, deleteConfig, updateConfig } from '../services/appointmentConfigService.js'
import logger from '../utils/logger.js'

export default defineStore('appointmentConfig', {
	state: () => {
		return {
			configs: {},
		}
	},
	getters: {
		allConfigs() {
			return Object.values(this.configs)
		},
	},
	actions: {
		addInitialConfigs(configs) {
			for (const config of configs) {
				Vue.set(this.configs, config.id, config)
			}
		},
		async updateConfig({ config }) {
			try {
				const updatedConfig = await updateConfig(config)
				this.updateConfigMutation(updatedConfig)
				return updatedConfig
			} catch (error) {
				logger.error('Failed to update config', { error })
				throw error
			}
		},
		async createConfig({ config }) {
			try {
				const fullConfig = await createConfig(config)
				this.addConfigMutation(fullConfig)
				return fullConfig
			} catch (error) {
				logger.error('Failed to create config', { error })
				throw error
			}
		},
		async deleteConfig({ id }) {
			try {
				await deleteConfig(id)
				this.deleteConfigMutation(id)
			} catch (error) {
				logger.error('Failed to delete config', { error })
				throw error
			}
		},
		updateConfigMutation(config) {
			if (!this.configs[config.id]) {
				return
			}

			Vue.set(this.configs, config.id, config.clone())
		},
		addConfigMutation(config) {
			Vue.set(this.configs, config.id, config)
		},
		deleteConfigMutation(id) {
			if (!this.configs[id]) {
				return
			}

			Vue.delete(this.configs, id)
		},
	},
})
