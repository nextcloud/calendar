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
		@click.prevent="onShow">
		<template #icon>
			<Delete :size="20" decorative />
		</template>
		<template #extra>
			<Modal v-if="showModal"
				size="large"
				@close="showModal = false">
				<div class="modal__content">
					<h2>{{ t('calendar', 'Trash bin') }}</h2>
					<EmptyContent v-if="loading"
						icon="icon-loading"
						class="modal__content__loading">
						<template #desc>
							{{ t('calendar', 'Loading deleted elements.') }}
						</template>
					</EmptyContent>
					<EmptyContent v-else-if="!items.length"
						class="modal__content__empty">
						<template #icon>
							<Delete :size="20" decorative />
						</template>
						<template #desc>
							{{ t('calendar', 'You do not have any deleted elements.') }}
						</template>
					</EmptyContent>
					<template v-else>
						<table>
							<tr>
								<th class="name">
									{{ t('calendar', 'Name') }}
								</th>
								<th class="deletedAt">
									{{ t('calendar', 'Deleted') }}
								</th>
								<th>&nbsp;</th>
							</tr>
							<tr v-for="item in items" :key="item.url">
								<td>
									<div class="item">
										<div>
											<div class="color-dot"
												:style="{ 'background-color': item.color }" />
										</div>

										<div>
											<div class="item-name">{{ item.name }}</div>
											<div v-if="item.subline" class="item-subline">
												{{ item.subline }}
											</div>
										</div>
									</div>
								</td>
								<td class="deletedAt">
									<Moment class="timestamp" :timestamp="item.deletedAt" />
								</td>
								<td class="item-actions">
									<button @click="restore(item)">
										{{ t('calendar','Restore') }}
									</button>

									<Actions :force-menu="true">
										<ActionButton @click="onDeletePermanently(item)">
											<template #icon>
												<Delete :size="20" decorative />
											</template>
											{{ t('calendar','Delete permanently') }}
										</ActionButton>
									</Actions>
								</td>
							</tr>
						</table>
						<div class="footer">
							<p v-if="retentionDuration">
								{{ n('calendar', 'Elements in the trash bin are deleted after {numDays} day', 'Elements in the trash bin are deleted after {numDays} days', retentionDuration, { numDays: retentionDuration }) }}
							</p>
							<button @click="onEmptyTrashBin()">
								{{ t('calendar','Empty trash bin') }}
							</button>
						</div>
					</template>
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
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import moment from '@nextcloud/moment'
import logger from '../../../utils/logger'
import { showError } from '@nextcloud/dialogs'
import { mapGetters } from 'vuex'
import Moment from './Moment'
import { uidToHexColor } from '../../../utils/color'

import Delete from 'vue-material-design-icons/Delete.vue'

export default {
	name: 'Trashbin',
	components: {
		AppNavigationItem,
		EmptyContent,
		Modal,
		Moment,
		Actions,
		ActionButton,
		Delete,
	},
	data() {
		return {
			showModal: false,
			loading: true,
		}
	},
	computed: {
		...mapGetters({
			trashBin: 'trashBin',
			timezoneObject: 'getResolvedTimezoneObject',
		}),
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
				color: calendar.color ?? uidToHexColor(calendar.displayname),
			}))
			const formattedCalendarObjects = this.objects.map(vobject => {
				let eventSummary = t('calendar', 'Untitled element')
				try {
					eventSummary = vobject?.calendarComponent.getComponentIterator().next().value?.title
				} catch (e) {
					// ignore
				}
				let subline = vobject.calendar?.displayName || t('calendar', 'Unknown calendar')
				if (vobject.isEvent) {
					const event = vobject?.calendarComponent.getFirstComponent('VEVENT')
					const utcOffset = (event?.startDate.getInTimezone(this.timezoneObject).utcOffset() ?? 0) / 60
					if (event?.startDate.jsDate && event?.isAllDay()) {
						subline += ' · ' + moment(event.startDate.jsDate).utcOffset(utcOffset).format('LL')
					} else if (event?.startDate.jsDate) {
						subline += ' · ' + moment(event?.startDate.jsDate).utcOffset(utcOffset).format('LLL')
					}
				}
				const color = vobject.calendarComponent.getComponentIterator().next().value?.color
						?? vobject.calendar?.color
						?? uidToHexColor(subline)
				return {
					vobject,
					type: 'object',
					key: vobject.id,
					name: eventSummary,
					subline,
					url: vobject.uri,
					deletedAt: vobject.dav._props['{http://nextcloud.com/ns}deleted-at'],
					color,
				}
			})

			return formattedCalendars.concat(formattedCalendarObjects).sort((item1, item2) => item2.deletedAt - item1.deletedAt)
		},
		retentionDuration() {
			return Math.ceil(
				this.trashBin.retentionDuration / (60 * 60 * 24)
			)
		},
	},
	methods: {
		async onShow() {
			this.showModal = true

			this.loading = true
			try {
				await Promise.all([
					this.$store.dispatch('loadDeletedCalendars'),
					this.$store.dispatch('loadDeletedCalendarObjects'),
				])

				logger.debug('deleted calendars and objects loaded', {
					calendars: this.calendars,
					objects: this.objects,
				})
			} catch (error) {
				logger.error('could not load deleted calendars and objects', {
					error,
				})

				showError(t('calendar', 'Could not load deleted calendars and objects'))
			}
			this.loading = false
		},
		async onDeletePermanently(item) {
			logger.debug('deleting ' + item.url + ' permanently', item)
			try {
				switch (item.type) {
				case 'calendar':
					await this.$store.dispatch('deleteCalendarPermanently', { calendar: item.calendar })
					break
				case 'object':
					await this.$store.dispatch('deleteCalendarObjectPermanently', { vobject: item.vobject })
					break
				}
			} catch (error) {
				logger.error('could not restore ' + item.url, { error })

				showError(t('calendar', 'Could not restore calendar or event'))
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
		onEmptyTrashBin() {
			OC.dialogs.confirm(
				t('calendar', 'Do you really want to empty the trash bin?'),
				t('calendar', 'Empty trash bin'),
				this.emptyTrashBin,
				true
			)
		},

		emptyTrashBin(confirm) {
			if (!confirm) {
				return
			}
			this.items.forEach((item) => {
				this.onDeletePermanently(item)
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.modal__content {
	margin: 2vw;

	&__loading,
	&__empty {
		margin-top: 25px !important;
	}
}

::v-deep .modal-wrapper .modal-container {
	overflow-y: auto;
	overflow-x: auto;
}

table {
	width: 100%;
}

th, td {
	padding: 4px;
}

th {
	color: var(--color-text-maxcontrast)
}

.item {
	display: flex;

	.item-name {
		white-space: normal;
	}

	.item-subline {
		color: var(--color-text-maxcontrast)
	}
}

.item-actions {
	text-align: right;
}

.deletedAt {
	text-align: right;
}

.footer {
	color: var(--color-text-lighter);
	text-align: center;
	font-size: small;
	margin-top: 16px;
	& > p {
		margin-bottom: 12px;
	}
}

.color-dot {
	display: inline-block;
	vertical-align: middle;
	width: 14px;
	height: 14px;
	margin-right: 14px;
	border: none;
	border-radius: 50%;
}
</style>
