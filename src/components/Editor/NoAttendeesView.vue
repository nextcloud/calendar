<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="editor-reminders-list-empty-message">
		<div class="icon editor-reminders-list-empty-message__icon">
			<slot name="icon">
				<AccountMultiple :size="50" decorative />
			</slot>
		</div>
		<div class="editor-reminders-list-empty-message__caption">
			{{ message }}
		</div>
	</div>
</template>

<script>
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'

export default {
	name: 'NoAttendeesView',
	components: {
		AccountMultiple,
	},
	props: {
		message: {
			type: String,
			required: true,
		},
	},
}
</script>
