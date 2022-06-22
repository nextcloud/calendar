<template>
	<div v-if="display" class="property-text-location">
		<component
			:is="icon"
			:size="20"
			:title="readableName"
			class="property-text__icon"
			:class="{ 'property-text__icon--hidden': !showIcon }" />

		<div
			class="property-text__input"
			:class="{ 'property-text__input--readonly': isReadOnly }">
			<textarea
				v-if="!isReadOnly"
				v-autosize="true"
				:placeholder="placeholder"
				:rows="rows"
				:title="readableName"
				:value="value"
				@input.prevent.stop="changeValue" />
			<span
				v-if="!isReadOnly"
				v-visible="visibleValue"
				:title="tagPlaceholder"
				v-on:click="goto"
				class="icon-externallink"></span>
			<!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
			<div
				v-else
				v-linkify="{ text: value, linkify: true }" />
		</div>
		<div
			v-if="hasInfo"
			v-tooltip="info"
			class="property-select__info">
			<InformationVariant
				:size="20"
				decorative />
		</div>
	</div>
</template>

<script>
import autosize from '../../../directives/autosize.js'
import PropertyMixin from '../../../mixins/PropertyMixin'
import linkify from '@nextcloud/vue/dist/Directives/Linkify'
import InformationVariant from 'vue-material-design-icons/InformationVariant.vue'

function isValidHttpUrl(string) {
	let url
	try {
		url = new URL(string)
	} catch (_) {
		return false
	}
	return url.protocol === 'http:' || url.protocol === 'https:'
}

function setVisibility(el, binding) {
	el.style.visibility = (binding.value === true) ? 'visible' : 'hidden'
}

export default {
	name: 'PropertyTextLocation',
	data: () => ({
		visibleValue: true
	}),
	directives: {
		autosize,
		linkify,
		InformationVariant,
		visible: {
			bind(el, binding) {
				 setVisibility(el, binding)
			},
			inserted(el, binding) {
				 setVisibility(el, binding)
			},
			update(el, binding) {
				 setVisibility(el, binding)
			},
			componentUpdated(el, binding) {
				 setVisibility(el, binding)
			}

		}
	},
	mixins: [
		PropertyMixin,
	],
	computed: {
		display() {
			if (this.isReadOnly) {
				if (typeof this.value !== 'string') {
					return false
				}
				if (this.value.trim() === '') {
					return false
				}
			}

			return true
		},
		/**
		 * Returns the default number of rows for a textarea.
		 * This is used to give the description field an automatic size 2 rows
		 *
		 * @return {number}
		 */
		rows() {
			return this.propModel.defaultNumberOfRows || 1
		},
	},
	methods: {
		changeValue(event) {
			if (event.target.value.trim() === '') {
				this.visibleValue = false
				this.$emit('update:value', null)
			} else {
				this.visibleValue = isValidHttpUrl(event.target.value.trim())
				this.$emit('update:value', event.target.value)
			}
		},
		goto() {
			const urlval = this.value
			window.open(urlval, '_blank').focus()
		},
	},
	mounted() {
		this.visibleValue = isValidHttpUrl(this.value)
	},
}
</script>
