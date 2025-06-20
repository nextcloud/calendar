<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcAppNavigationItem :name="t('calendar', 'Trash bin')"
		:pinned="true"
		@click.prevent="onShow">
		<template #icon>
			<IconDelete :size="20" decorative />
		</template>
		<template #extra>
			<NcModal v-if="showModal"
				size="large"
				@close="showModal = false">
				<div class="modal__content">
					<h2>{{ t('calendar', 'Trash bin') }}</h2>
					<NcEmptyContent v-if="loading"
						icon="icon-loading"
						class="modal__content__loading"
						:description="t('calendar', 'Loading deleted items.')" />
					<NcEmptyContent v-else-if="!items.length"
						class="modal__content__empty"
						:description="t('calendar', 'You do not have any deleted items.')">
						<template #icon>
							<Delete :size="20" decorative />
						</template>
					</NcEmptyContent>
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
											<div class="item-name">
												{{ item.name }}
											</div>
											<div v-if="item.subline" class="item-subline">
												{{ item.subline }}
											</div>
										</div>
									</div>
								</td>
								<td class="deletedAt">
									<NcDateTime class="timestamp" :timestamp="item.deletedAt" />
								</td>
								<td>
									<div class="item-actions">
										<NcButton type="secondary" @click="restore(item)">
											{{ t('calendar','Restore') }}
										</NcButton>

										<NcActions :force-menu="true">
											<NcActionButton @click="onDeletePermanently(item)">
												<template #icon>
													<Delete :size="20" decorative />
												</template>
												{{ t('calendar','Delete permanently') }}
											</NcActionButton>
										</NcActions>
									</div>
								</td>
							</tr>
						</table>
						<div class="footer">
							<p v-if="retentionDuration">
								{{ n('calendar', 'Items in the trash bin are deleted after {numDays} day', 'Items in the trash bin are deleted after {numDays} days', retentionDuration, { numDays: retentionDuration }) }}
							</p>
							<NcButton type="error" @click="onEmptyTrashBin()">
								{{ t('calendar','Empty trash bin') }}
							</NcButton>
						</div>
					</template>
				</div>
			</NcModal>
		</template>
	</NcAppNavigationItem>
</template>

<script>
import {
	NcAppNavigationItem,
	NcActions,
	NcActionButton,
	NcModal,
	NcEmptyContent,
	NcButton,
	NcDateTime,
} from '@nextcloud/vue'
import moment from '@nextcloud/moment'
import logger from '../../../utils/logger.js'
import { showError } from '@nextcloud/dialogs'
import { uidToHexColor } from '../../../utils/color.js'
import useCalendarsStore from '../../../store/calendars.js'
import useSettingsStore from '../../../store/settings.js'
import { mapStores, mapState } from 'pinia'

import IconDelete from 'vue-material-design-icons/Delete.vue'

export default {
	name: 'Trashbin',
	components: {
		NcActions,
		NcActionButton,
		NcAppNavigationItem,
		NcButton,
		NcDateTime,
		NcEmptyContent,
		NcModal,
		IconDelete,
	},
	data() {
		return {
			showModal: false,
			loading: true,
		}
	},
	computed: {
		...mapStores(useCalendarsStore),
		...mapState(useSettingsStore, {
			timezoneObject: 'getResolvedTimezoneObject',
		}),
		calendars() {
			return this.calendarsStore.sortedDeletedCalendars
		},
		objects() {
			return this.calendarsStore.allDeletedCalendarObjects
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
				let eventSummary = t('calendar', 'Untitled item')
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
				this.calendarsStore.trashBin.retentionDuration / (60 * 60 * 24),
			)
		},
	},
	methods: {
		async onShow() {
			this.showModal = true

			this.loading = true
			try {
				await Promise.all([
					this.calendarsStore.loadDeletedCalendars(),
					this.calendarsStore.loadDeletedCalendarObjects(),
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
					await this.calendarsStore.deleteCalendarPermanently({ calendar: item.calendar })
					break
				case 'object':
					await this.calendarsStore.deleteCalendarObjectPermanently({ vobject: item.vobject })
					break
				}
			} catch (error) {
				logger.error('could not delete ' + item.url, { error })

				showError(t('calendar', 'Could not delete calendar or event'))
			}
		},
		async restore(item) {
			logger.debug('restoring ' + item.url, item)
			try {
				switch (item.type) {
				case 'calendar':
					await this.calendarsStore.restoreCalendar({ calendar: item.calendar })
					await this.calendarsStore.loadCollections()
					break
				case 'object':
					await this.calendarsStore.restoreCalendarObject({ vobject: item.vobject })
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
				true,
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

:deep(.modal-wrapper .modal-container) {
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
	display: flex;
	justify-content: flex-end;
	gap: 5px;
}

.deletedAt {
	text-align: right;
}

.footer {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--color-text-lighter);
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
