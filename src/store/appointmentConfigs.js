/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineStore } from 'pinia'
import { createConfig, deleteConfig, updateConfig } from '../services/appointmentConfigService.js'
import logger from '../utils/logger.js'

export default defineStore('appointmentConfigs', {
	state: () => {
		return {
			configs: {},
		}
	},
	getters: {
		allConfigs: (state) => Object.values(state.configs),
	},
	actions: {
		addInitialConfigs(configs) {
			for (const config of configs) {
				this.configs[config.id] = config
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

			this.configs[config.id] = config.clone()
		},
		addConfigMutation(config) {
			this.configs[config.id] = config.clone()
		},
		deleteConfigMutation(id) {
			if (!this.configs[id]) {
				return
			}

			delete this.configs[id]
		},
	},
})
