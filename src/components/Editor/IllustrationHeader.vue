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
	<!-- Using v-html won't cause any XSS here, -->
	<!-- because illustrationUrl comes from a fixed list of SVGs -->
	<!-- and while color is based on user-input, -->
	<!-- we use a validator to make sure it's actually a HEX RGB code -->
	<!-- eslint-disable-next-line vue/no-v-html -->
	<div class="background-image" v-html="coloredSVG" />
</template>

<script>
import HttpClient from '@nextcloud/axios'

export default {
	name: 'IllustrationHeader',
	props: {
		illustrationUrl: {
			type: String,
			required: true
		},
		color: {
			type: String,
			required: true,
			validator: (s) => /^(#)((?:[A-Fa-f0-9]{3}){1,2})$/.test(s)
		}
	},
	data() {
		return {
			svg: ''
		}
	},
	computed: {
		coloredSVG() {
			return this.svg
				.replace(/#6c63ff/g, this.color)
				.replace(/height="(\d)*(.(\d)*)?"/i, '')
				.replace(/width="(\d)*(.(\d)*)?"/i, '')
		}
	},
	watch: {
		illustrationUrl: {
			handler(newUrl, oldUrl) {
				if (oldUrl === newUrl) {
					return
				}

				HttpClient.get(newUrl)
					.then((response) => {
						this.svg = response.data
					})
					.catch(() => {
						this.svg = ''
					})
			},
			immediate: true
		}
	}
}
</script>

<style>
.background-image {
	max-height: 150px;
	height: 150px;
	width: 100%;
}

.background-image svg {
	width: 100%;
	height: 150px;
	padding: 8px 8px 0 8px;
}
</style>
