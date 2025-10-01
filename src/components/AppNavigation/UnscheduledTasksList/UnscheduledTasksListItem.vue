<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<ListItem
		:id="config.id + '-1'"
		class="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event"
		:data-event="JSON.stringify({ title: config.title })"
		compact
		style="background-color: transparent !important; border: none !important;"
		:name="config.title"
		@click="handleClick">
		<template #icon>
			<div
				class="icon-wrapper"
				:style="{ backgroundColor: color, minWidth: '13px', minHeight: '13px', width: '13px', height: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }" />
		</template>
	</ListItem>
</template>

<script>
import { Draggable } from '@fullcalendar/interaction'
import {
	NcListItem as ListItem,
} from '@nextcloud/vue'

export default {
	name: 'UnscheduledTasksListItem',

	components: {
		ListItem,
	},

	props: {
		config: {
			type: Object,
			required: true,
		},

		color: {
			type: String,
			required: false, // or true if needed
			default: '#000000', // optional default value
		},
	},

	mounted() {
		const containerEl = document.getElementById(this.config.id + '-1')

		new Draggable(containerEl, {
			itemSelector: '.fc-event',
			eventData: this.config,
		})
	},

	methods: {
		handleClick() {
			this.$emit('task-clicked', this.config)
		},
	},
}
</script>
