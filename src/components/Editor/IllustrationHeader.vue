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
