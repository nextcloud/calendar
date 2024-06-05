<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<transition name="fade" mode="out-in">
		<!-- Using v-html won't cause any XSS here, -->
		<!-- because illustrationUrl comes from a fixed list of SVGs -->
		<!-- and while color is based on user-input, -->
		<!-- we use a validator to make sure it's actually a HEX RGB code -->
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div :key="illustrationUrl" class="illustration-header" v-html="coloredSVG" />
	</transition>
</template>

<script>
import HttpClient from '@nextcloud/axios'
import { uidToHexColor } from '../../utils/color.js'

export default {
	name: 'IllustrationHeader',
	props: {
		illustrationUrl: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			required: true,
			validator: (s) => /^(#)((?:[A-Fa-f0-9]{3}){1,2})$/.test(s),
		},
	},
	data() {
		return {
			svg: '',
		}
	},
	computed: {
		coloredSVG() {
			let color = this.color
			if (!/^(#)((?:[A-Fa-f0-9]{3}){1,2})$/.test(color)) {
				color = uidToHexColor(color)
			}

			if (!color.startsWith('#')) {
				color = '#' + color
			}

			return this.svg
				.replace(/#6c63ff/g, color)
				.replace(/<title>[\w\d\s-]*<\/title>/i, '')
				.replace(/height="(\d)*(.(\d)*)?"/i, '')
				.replace(/width="(\d)*(.(\d)*)?"/i, '')
		},
	},
	watch: {
		illustrationUrl: {
			async handler(newUrl, oldUrl) {
				if (oldUrl === newUrl) {
					return
				}

				try {
					const response = await HttpClient.get(newUrl)
					this.svg = response.data
				} catch (error) {
					console.debug(error)
					this.svg = ''
				}
			},
			immediate: true,
		},
	},
}
</script>

<style lang="scss" scoped>
	.fade-enter-active, .fade-leave-active {
		transition: opacity .3s;
	}

	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
</style>
