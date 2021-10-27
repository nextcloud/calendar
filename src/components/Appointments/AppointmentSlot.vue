<!--
  - @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
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
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<button class="appointment-slot" @click="$emit('click', $event)">
		{{ startTime }} - {{ endTime }}
	</button>
</template>

<script>
import { timeStampToLocaleTime } from '../../utils/localeTime'

export default {
	name: 'AppointmentSlot',
	props: {
		start: {
			required: true,
			type: Number,
		},
		end: {
			required: true,
			type: Number,
		},
		timeZoneId: {
			required: true,
			type: String,
		},
	},
	computed: {
		dateTimeFormatter() {
			return Intl.DateTimeFormat(undefined, {
				timeZone: this.timeZoneId,
				timeStyle: 'full',
				dateStyle: 'short',
			})
		},
		startTime() {
			return timeStampToLocaleTime(this.start, this.timeZoneId)
		},
		endTime() {
			return timeStampToLocaleTime(this.end, this.timeZoneId)
		},
	},
}
</script>
