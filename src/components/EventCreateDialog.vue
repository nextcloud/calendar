<!--
  - @copyright Copyright (c) 2021 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Julius Härtl <jus@bitgrid.net>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
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
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<Modal class="card-selector" @close="close">
		<div class="modal-scroller">
			<div v-if="!creating && !created" id="modal-inner" :class="{ 'icon-loading': loading }">
				<h3>{{ t('calender', 'Create a new event') }}</h3>
			</div>
		</div>
	</Modal>
</template>

<script>

import Modal from '@nextcloud/vue/dist/Components/Modal'
// import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
// import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'

export default {
	name: 'EventCreateDialog',
	components: {
		// EmptyContent,
		Modal,
		// Multiselect,
	},
	props: {
		title: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
		action: {
			type: String,
			default: t('calender', 'Create event'),
		},
	},
	data() {
		return {

		}
	},

	methods: {

		close() {
			this.$root.$emit('close')
		},

	},

}
</script>

<style lang="scss" scoped>
	.modal-scroller {
		overflow: scroll;
		max-height: calc(80vh - 40px);
		margin: 10px;
	}

	#modal-inner {
		width: 90vw;
		max-width: 400px;
		padding: 10px;
		min-height: 200px;
	}

	.multiselect-board, .multiselect-list, input, textarea {
		width: 100%;
		margin-bottom: 10px !important;
	}

	ul {
		min-height: 100px;
	}

	li {
		padding: 6px;
		border: 1px solid transparent;
	}

	li:hover, li:focus {
		background-color: var(--color-background-dark);
	}

	.board-bullet {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}

	.modal-buttons {
		display: flex;
		justify-content: flex-end;
	}

	.card-selector::v-deep .modal-container {
		overflow: visible !important;
	}

	.empty-content {
		margin-top: 5vh !important;

		&::v-deep h2 {
			margin-bottom: 5vh;
		}
	}
</style>
