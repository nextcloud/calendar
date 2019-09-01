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
			<div v-if="isReadOnly">
				{{ value }}
			</div>
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
textarea {
	width: 100%;
}

textarea {
	font-size: 20px
}
</style>
