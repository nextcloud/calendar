<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<ListItem :id="config.id + '-1'"
		class="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event" 
		:data-event="JSON.stringify({ title: config.title })"
		compact
		@click="handleClick"
		style="background-color: transparent !important; border: none !important;"
		:name="config.title">
		<template #icon>
		<div class="icon-wrapper"
			:style="{ backgroundColor: color, minWidth: '13px', minHeight: '13px', width: '13px', height: '13px',  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }">
		</div>
		</template>

	</ListItem>
</template>

<script>
import {
	NcListItem as ListItem,
} from '@nextcloud/vue'

import { Draggable } from '@fullcalendar/interaction'

export default {
	name: 'UnscheduledTasksListItem',
	
	components: {
		ListItem,
	},

	mounted() {
		const containerEl = document.getElementById(this.config.id + '-1')
		/* eslint-disable no-new */
		new Draggable(containerEl, {
			itemSelector: '.fc-event',
			eventData: this.config,
		})
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

	methods: {
		handleClick() {
			this.$emit('task-clicked', this.config)
		},		
	},
}
</script>