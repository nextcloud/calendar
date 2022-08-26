<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
  -->

<template>
	<Modal v-if="show" @close="onClose">
		<div class="drag-recurrence-modal__content">
			<SaveButtons
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:force-this-and-all-future="forceThisAndAllFuture"
				:is-new="false"
				class="drag-recurrence-modal__content__buttons"
				@save-this-only="saveAndLeave(false)"
				@save-this-and-all-future="saveAndLeave(true)" />
		</div>
	</Modal>
</template>

<script>
import Modal from '@nextcloud/vue/dist/Components/Modal'
import SaveButtons from './Editor/SaveButtons'
import { mapState } from 'vuex'

export default {
	name: 'DragRecurrenceModal',
	components: {
		Modal,
		SaveButtons,
	},
	data() {
		return {
			isLoading: false,
		}
	},
	computed: {
		...mapState({
			show: state => state.dragRecurrenceModal.show,
			resolve: state => state.dragRecurrenceModal.resolve,
			reject: state => state.dragRecurrenceModal.reject,
			eventComponent: state => state.dragRecurrenceModal.eventComponent,
		}),
		/**
		 * @return {boolean}
		 */
		canCreateRecurrenceException() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.canCreateRecurrenceExceptions()
		},
		/**
		 * @return {boolean}
		 */
		forceThisAndAllFuture() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.isMasterItem() || this.eventComponent.isExactForkOfPrimary
		},
	},
	methods: {
		onClose() {
			this.reject('closedByUser')
		},
		/**
		 * @param {boolean} thisAndAllFuture Also update all future instances
		 */
		async saveAndLeave(thisAndAllFuture) {
			this.resolve(thisAndAllFuture || this.forceThisAndAllFuture)
		},
	},
}
</script>
