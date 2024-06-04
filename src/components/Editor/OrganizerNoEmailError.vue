<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="editor-invitee-list-no-email-configured-message">
		<div class="editor-invitee-list-no-email-configured-message__icon">
			@
		</div>
		<!-- Using v-html won't cause any XSS here, -->
		<!-- because: -->
		<!--  - t is escaping the translated string -->
		<!--  - the replaceables [linkopen] and [linkclose] do not contain any user input -->
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="editor-invitee-list-no-email-configured-message__caption" v-html="htmlCaption" />
	</div>
</template>

<script>
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'OrganizerNoEmailError',
	computed: {
		/**
		 * This returns the caption of the warning message, including a link to the personal settings
		 *
		 * @return {string}
		 */
		htmlCaption() {
			return this.$t('calendar', 'To send out invitations and handle responses, [linkopen]add your email address in personal settings[linkclose].')
				.replace('[linkopen]', `<a target="_blank" href="${generateUrl('settings/user')}">`)
				.replace('[linkclose]', '</a>')
		},
	},
}
</script>
