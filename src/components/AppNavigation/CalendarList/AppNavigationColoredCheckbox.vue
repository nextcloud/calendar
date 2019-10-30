<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
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
	<svg
		v-if="enabled"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 500 500"
		height="32px"
		width="32px">
		<path d="M354.24 98H145.76c-25.54 0-46.44 20.9-46.44 46.44v211.12c0 25.54 20.9 46.44 46.44 46.44h208.47c25.54 0 46.44-20.9 46.44-46.44V144.44C400.68 118.9 379.78 98 354.24 98zM224.57 338.56l-84.59-87.23 27.93-26.71 56.66 58.43 107.31-109.42 27.51 27.47-134.82 137.46z" :fill="color" />
	</svg>
	<svg
		v-else
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 500 500"
		height="32px"
		width="32px">
		<path d="M354.24 98H145.76c-25.54 0-46.44 20.9-46.44 46.44v211.12c0 25.54 20.9 46.44 46.44 46.44h208.47c25.54 0 46.44-20.9 46.44-46.44V144.44C400.68 118.9 379.78 98 354.24 98zm10.75 268.28H135.01V133.72h229.98v232.56z" :fill="color" />
	</svg>
</template>

<script>
export default {
	name: 'AppNavigationColoredCheckbox',
	props: {
		color: {
			type: String,
			required: true,
		},
		enabled: {
			type: Boolean,
			required: true,
		},
	},
}
</script>
