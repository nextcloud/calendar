<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
