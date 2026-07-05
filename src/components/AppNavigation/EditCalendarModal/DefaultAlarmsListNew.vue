<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<PropertySelect
		:propModel="propModel"
		:isReadOnly="disabled"
		:value="null"
		:showIcon="showIcon"
		class="property-alarm-new"
		@update:value="addReminderFromSelect" />
</template>

<script>
import { mapState, mapStores } from 'pinia'
import PropertySelect from '../../Editor/Properties/PropertySelect.vue'
import { getDefaultAlarms } from '../../../defaults/defaultAlarmProvider.js'
import alarmFormat from '../../../filters/alarmFormat.js'
import useSettingsStore from '../../../store/settings.js'
import { triggerToAlarmObject } from '../../../utils/defaultCalendarAlarms.js'

export default {
	name: 'DefaultAlarmsListNew',
	components: {
		PropertySelect,
	},

	props: {
		isAllDay: {
			type: Boolean,
			required: true,
		},

		showIcon: {
			type: Boolean,
			required: true,
		},

		disabled: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		...mapState(useSettingsStore, {
			locale: 'momentLocale',
		}),

		...mapStores(useSettingsStore),
		currentUserTimezone() {
			return this.settingsStore.getResolvedTimezone
		},

		options() {
			return getDefaultAlarms(this.isAllDay).map((defaultAlarm) => {
				const alarmObject = triggerToAlarmObject(defaultAlarm)

				return {
					value: defaultAlarm,
					label: alarmFormat(alarmObject, this.isAllDay, this.currentUserTimezone, this.locale),
				}
			})
		},

		propModel() {
			return {
				options: this.options,
				icon: 'Bell',
				placeholder: this.$t('calendar', 'Add reminder'),
				readableName: this.$t('calendar', 'Add reminder'),
			}
		},
	},

	methods: {
		addReminderFromSelect(value) {
			this.$emit('addAlarm', {
				trigger: value,
				action: 'DISPLAY',
			})
		},
	},
}
</script>
