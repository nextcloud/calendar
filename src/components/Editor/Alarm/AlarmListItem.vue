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
	<div class="reminder-row">
		<div class="avatar" :class="icon" />
		<div class="label">
			{{ alarm | formatAlarm }}
		</div>
		<div class="options">
			<Actions>
				<ActionButton />
				<ActionButton />
			</Actions>
		</div>
	</div>
</template>

<script>
import {
	Actions,
	ActionButton,
} from 'nextcloud-vue'

export default {
	name: 'AlarmListItem',
	components: {
		Actions,
		ActionButton
	},
	props: {
		alarm: {
			type: Object,
			required: true
		}
	},
	computed: {
		icon() {
			if (this.type === 'AUDIO') {
				return 'icon-reminder-audio'
			}

			if (this.type === 'DISPLAY') {
				return 'icon-reminder'
			}

			if (this.type === 'EMAIL') {
				return 'icon-reminder-mail'
			}

			return 'icon-settings-dark'
		},
		type() {
			return 'AUDIO'
		}
	}
}
</script>

<style scoped>
.avatar {
	width: 32px;
	height: 32px;
	background-color: #dbdbdb;
}

.label {
	padding: 0 8px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.options {
	margin-left: auto;
	display: flex;
	align-items: center;
	white-space: nowrap;
}

.reminder-row {
	display: flex;
}
</style>
