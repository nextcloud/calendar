<!--
  - @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
  -
  - @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
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
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<AppNavigationItem :title="t('calendar', 'Trash bin')"
		:pinned="true"
		icon="icon-delete"
		@click.prevent="onShow">
		<template #extra>
			<Modal v-if="showModal"
				@close="showModal = false">
				<div class="modal__content">
					<h2>{{ t('calendar', 'Trash bin') }}</h2>
					<span v-if="!items.length">{{ t('calendar', 'You do not have any deleted calendars or events') }}</span>
					<table v-else>
						<tr>
							<th>{{ t('calendar', 'Name') }}</th>
							<th class="deletedAt">
								{{ t('calendar', 'Deleted at') }}
							</th>
							<th>&nbsp;</th>
						</tr>
						<tr v-for="item in items" :key="item.url">
							<td>{{ item.name }}</td>
							<td class="deletedAt">
								<Moment class="timestamp" :timestamp="item.deletedAt" />
							</td>
							<td>
								<button @click="restore(item)">
									{{ t('calendar','Restore') }}
								</button>
								<Actions :force-menu="true">
									<ActionButton
											icon="icon-delete"
											@click="onDelete">
										{{ t('calendar','Delete permanently') }}
									</ActionButton>
								</Actions>
							</td>
						</tr>
					</table>
				</div>
			</Modal>
		</template>
	</AppNavigationItem>
</template>

<script>
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import logger from '../../../utils/logger'
import { showError } from '@nextcloud/dialogs'
import { mapGetters } from 'vuex'
import Moment from './Moment'

export default {
	name: 'Trashbin',
	components: {
		AppNavigationItem,
		Modal,
		Moment,
		Actions,
		ActionButton,
	},
	data() {
		return {
			showModal: false,
		}
	},
	computed: {
		...mapGetters([
			'trashBin',
		]),
		calendars() {
			return this.$store.getters.sortedDeletedCalendars
		},
		objects() {
			return this.$store.getters.deletedCalendarObjects
		},
		items() {
			const formattedCalendars = this.calendars.map(calendar => ({
				calendar,
				type: 'calendar',
				key: calendar.url,
				name: calendar.displayname,
				url: calendar._url,
				deletedAt: calendar._props['{http://nextcloud.com/ns}deleted-at'],
			}))
			const formattedCalendarObjects = this.objects.map(vobject => {
				let eventSummary = t('calendar', 'Untitled event')
				try {
					// TODO: there _has to be_ a less error prone way …
					eventSummary = vobject.calendarComponent?._components?.get('VEVENT')[0]?._properties?.get('SUMMARY')[0]?.value
				} catch (e) {
					// ignore
				}
				return {
					vobject,
					type: 'object',
					key: vobject.id,
					name: `${eventSummary} (${vobject.calendar.displayName})`,
					url: vobject.uri,
					deletedAt: vobject.dav._props['{http://nextcloud.com/ns}deleted-at'],
				}
			})

			return formattedCalendars.concat(formattedCalendarObjects)
		},
	},
	methods: {
		async onShow() {
			this.showModal = true

			try {
				await Promise.all([
					this.$store.dispatch('loadDeletedCalendars'),
					this.$store.dispatch('loadDeletedCalendarObjects'),
				])

				logger.debug('deleted calendars loaded', {
					calendars: this.calendars,
					objects: this.objects,
				})
			} catch (error) {
				logger.error('could not load deleted calendars and objects', {
					error,
				})

				showError(t('calendar', 'Could not load deleted calendars and objects'))
			}
		},
		async restore(item) {
			logger.debug('restoring ' + item.url, item)
			try {
				switch (item.type) {
				case 'calendar':
					await this.$store.dispatch('restoreCalendar', { calendar: item.calendar })
					this.$store.dispatch('loadCollections')
					break
				case 'object':
					await this.$store.dispatch('restoreCalendarObject', { vobject: item.vobject })
					break
				}
			} catch (error) {
				logger.error('could not restore ' + item.url, { error })

				showError(t('calendar', 'Could not restore calendar or event'))
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.modal__content {
	width: 40vw;
	margin: 2vw;
}
table {
	width: 100%;
}
th, td {
	padding: 4px;
}
th {
	font-weight: bold;
}
.deletedAt {
	text-align: right;
}
</style>
