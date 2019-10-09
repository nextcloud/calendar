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
	<div>
		<h2>{{ endRepeatLabel }}</h2>
		<div class="end-row">
			<input id="repeat-end-repeat-never" :checked="isNeverSelected"
				class="checkbox" type="checkbox"
			>
			<label for="repeat-end-repeat-never">
				{{ neverLabel }}
			</label>
		</div>
		<div class="end-row">
			<input id="repeat-end-repeat-until" :checked="isOnSelected"
				class="checkbox" type="checkbox"
			>
			<label for="repeat-end-repeat-until">
				{{ onLabel }}
			</label>
			<DatetimePicker />
		</div>
		<div class="end-row">
			<input id="repeat-end-repeat-count" :checked="isAfterSelected"
				class="checkbox" type="checkbox"
			>
			<label for="repeat-end-repeat-count">
				{{ afterLabel }}
			</label>
			<input id="repeat-end-repeat-count-input"
				v-model="count" type="number"
				min="1" :max="maxCount"
			>
			<label for="repeat-end-repeat-count-input">
				{{ occurrencesLabel }}
			</label>
		</div>
	</div>
</template>

<script>
import {
	DatetimePicker
} from 'nextcloud-vue'

export default {
	name: 'RepeatEndRepeat',
	components: {
		DatetimePicker,
	},
	props: {
		count: {
			type: Number,
			default: null
		},
		until: {
			type: Date,
			default: null
		}
	},
	computed: {
		endRepeatLabel() {
			return this.$t('calendar', 'End repeat ...')
		},
		isNeverSelected() {
			return this.count === null && this.until === null
		},
		neverLabel() {
			return this.$t('calendar', 'Never')
		},
		isOnSelected() {
			return this.until !== null
		},
		onLabel() {
			return this.$t('calendar', 'On')
		},
		isAfterSelected() {
			return this.count !== null
		},
		afterLabel() {
			return this.$t('calendar', 'After')
		},
		occurrencesLabel() {
			return this.$n('calendar', 'count', 'counts', this.count)
		},
		maxCount() {
			// This is also the limit that we currently enforce in the server,
			// so it makes sense to limit it here.
			return 3500
		}
	},
	methods: {
		setInfinite() {
			this.$emit('setInfinite')
		},
		setOn() {
			this.$emit('setUntil', {})
		},
		setAfter() {
			this.$emit('setCount', {})
		}
	}
}
</script>

<style>
.end-row {
	display: flex;
}

label {
	min-width: 100px;
}
</style>
