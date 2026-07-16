<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="property-alarm-list">
		<DefaultAlarmsListNew
			:isAllDay="isAllDay"
			:showIcon="alarms.length === 0"
			@addAlarm="addAlarm" />
		<DefaultAlarmsListItem
			v-for="(alarm, index) in alarms"
			:key="index"
			:alarm="alarm"
			:isAllDay="isAllDay"
			:showIcon="index === 0"
			@updateAlarm="(updated) => updateAlarm(index, updated)"
			@removeAlarm="removeAlarm(index)" />
	</div>
</template>

<script>
import DefaultAlarmsListItem from './DefaultAlarmsListItem.vue'
import DefaultAlarmsListNew from './DefaultAlarmsListNew.vue'

export default {
	name: 'DefaultAlarmsList',
	components: {
		DefaultAlarmsListItem,
		DefaultAlarmsListNew,
	},

	props: {
		isAllDay: {
			type: Boolean,
			required: true,
		},

		modelValue: {
			type: Array,
			required: true,
		},
	},

	computed: {
		alarms() {
			return this.modelValue
		},
	},

	methods: {
		addAlarm(alarm) {
			this.$emit('update:modelValue', [...this.alarms, alarm])
		},

		updateAlarm(index, updated) {
			const next = [...this.alarms]
			next[index] = updated
			this.$emit('update:modelValue', next)
		},

		removeAlarm(index) {
			const next = [...this.alarms]
			next.splice(index, 1)
			this.$emit('update:modelValue', next)
		},
	},
}
</script>
