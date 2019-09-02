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
	<div v-if="eventComponentLoaded" class="property-wrapper">
		<div class="property-input">
			<textarea v-if="!isReadOnly" v-autosize :value="value"
				:placeholder="placeholder" :title="readableName" rows="1"
				@input="changeValue"
			/>
			<div class="fake-input-box" v-if="isReadOnly">{{ readOnlyValue }}</div>
		</div>
	</div>
</template>

<script>
import autosize from 'v-autosize'
import PropertyMixin from '../../../mixins/PropertyMixin'

export default {
	name: 'PropertyTitle',
	directives: {
		autosize
	},
	mixins: [
		PropertyMixin
	],
	data() {
		return {
			value: null
		}
	},
	computed: {
		readOnlyValue() {
			if (typeof this.value !== 'string') {
				return t('calendar', 'Untitled event')
			}

			if (this.value.trim() === '') {
				return t('calendar', 'Untitled event')
			}

			return this.value
		}
	},
	watch: {
		eventComponent() {
			this.initValue()
		}
	},
	created() {
		this.initValue()
	},
	methods: {
		changeValue(event) {
			if (!this.eventComponentLoaded) {
				return
			}

			this.eventComponent[this.propModel.name] = event.target.value
		},
		initValue() {
			if (!this.eventComponentLoaded) {
				return
			}

			this.value = this.eventComponent[this.propModel.name]
		}
	}
}
</script>

<style scoped>
.property-wrapper,
.property-input,
.fake-input-box,
textarea {
	width: 100%;
}

textarea,
.fake-input-box {
	font-size: 20px
}

.fake-input-box {
	white-space: pre-line;
	margin: 3px 3px 3px 0;
	padding: 7px 6px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	border: 1px solid var(--color-border-dark);
	outline: none;
	border-radius: var(--border-radius);
	cursor: not-allowed;
}
</style>
