<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
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
		 * @returns {string}
		 */
		htmlCaption() {
			return this.$t('calendar', 'To send out invitations and handle responses,  [linkopen]add your email address in personal settings[linkclose].')
				.replace('[linkopen]', `<a target="_blank" href="${generateUrl('settings/user')}">`)
				.replace('[linkclose]', '</a>')
		},
	},
}
</script>
