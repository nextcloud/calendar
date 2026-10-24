<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcDialog
		:open="showDialog"
		:name="$t('calendar', 'Search resource')"
		size="large"
		@update:open="(e) => $emit('update:show-dialog', e)">
		<div class="modal__content__header">
			<ResourceAvailabilityFilters
				v-model:filters="filters"
				:resourceTypes="resourceFilterOptions.resourceType"
				:vehicleTypes="resourceFilterOptions.vehicleType"
				:vehicleMakes="resourceFilterOptions.vehicleMake"
				:vehicleModels="resourceFilterOptions.vehicleModel" />
			<table>
				<thead>
					<tr>
						<th class="name">
							{{ $t('calendar', 'Resource name') }}
						</th>
						<th class="availability">
							{{ $t('calendar', 'Availability') }}
						</th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="resource in filteredResources" :key="resource.id">
						<td>
							<div class="item">
								<div>
									<div class="item-name">
										{{ resource.displayname }}
									</div>
								</div>
							</div>
						</td>
						<td class="availability">
							<AvailabilityIndicator
								:available="availabilityFor(resource)" />
						</td>
						<td>
							<div class="item-actions">
								<NcButton
									variant="secondary"
									class="resources__availability"
									@click="openResourceAvailability(resource)">
									{{ $t('calendar', 'Check resource availability') }}
								</NcButton>
								<NcButton
									variant="primary"
									class="resources__reserve"
									:disabled="!canReserve(resource)"
									@click="reserve(resource)">
									{{ isReserved(resource) ? $t('calendar', 'Reserved') : $t('calendar', 'Reserve') }}
								</NcButton>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<div>
				<ResourceAvailabilityModal
					v-if="showResourceAvailabilityModal"
					:show="showResourceAvailabilityModal"
					:startDate="calendarObjectInstance.startDate"
					:endDate="calendarObjectInstance.endDate"
					:resources="selectedResources"
					:calendarObjectInstance="calendarObjectInstance"
					:organizer="currentUserPrincipalAsAttendee"
					@update:show="setShowResourceAvailabilityModal" />
			</div>
		</div>
	</NcDialog>
</template>

<script>
import { NcButton, NcDialog } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import AvailabilityIndicator from './AvailabilityIndicator.vue'
import ResourceAvailabilityFilters from './ResourceAvailabilityFilters.vue'
import ResourceAvailabilityModal from './ResourceAvailabilityModal.vue'
import principalAvailabilityMixin from '../../../mixins/principalAvailabilityMixin.js'
import principalReservationMixin from '../../../mixins/principalReservationMixin.js'
import { mapPrincipalObjectToAttendeeObject } from '../../../models/attendee.js'
import usePrincipalsStore from '../../../store/principals.js'

export default {
	name: 'ResourceAvailabilityList',
	components: {
		AvailabilityIndicator,
		NcButton,
		NcDialog,
		ResourceAvailabilityFilters,
		ResourceAvailabilityModal,
	},

	mixins: [principalAvailabilityMixin, principalReservationMixin],

	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},

		startDate: {
			type: Date,
			required: true,
		},

		endDate: {
			type: Date,
			required: true,
		},

		showDialog: {
			type: Boolean,
			default: true,
		},
	},

	emits: ['update:show-dialog', 'addResource'],

	data() {
		return {
			filters: {},
			showResourceAvailabilityModal: false,
			selectedResources: [],
		}
	},

	computed: {
		...mapStores(usePrincipalsStore),
		resources() {
			return this.principalsStore.getResourcePrincipals
		},

		/**
		 * The distinct values each select filter offers across the resources.
		 *
		 * @return {object} Map of filter key -> distinct non-empty values, sorted
		 */
		resourceFilterOptions() {
			const options = {
				resourceType: new Set(),
				vehicleType: new Set(),
				vehicleMake: new Set(),
				vehicleModel: new Set(),
			}
			for (const resource of this.resources) {
				const attributes = this.resourceAttributes(resource)
				for (const [key, values] of Object.entries(options)) {
					if (attributes[key] !== null && attributes[key] !== '') {
						values.add(attributes[key])
					}
				}
			}

			for (const key in options) {
				options[key] = [...options[key]].sort()
			}

			return options
		},

		filteredResources() {
			const {
				searchTerm = '',
				resourceType = null,
				vehicleType = null,
				vehicleMake = null,
				vehicleModel = null,
				minSeatingCapacity = null,
				minRange = null,
				isElectric = false,
			} = this.filters
			const term = searchTerm.trim().toLowerCase()

			return this.resources.filter((resource) => {
				const attributes = this.resourceAttributes(resource)

				return (term === '' || attributes.displayName.toLowerCase().includes(term))
					&& (resourceType === null || attributes.resourceType === resourceType)
					&& (vehicleType === null || attributes.vehicleType === vehicleType)
					&& (vehicleMake === null || attributes.vehicleMake === vehicleMake)
					&& (vehicleModel === null || attributes.vehicleModel === vehicleModel)
					&& (minSeatingCapacity === null || (attributes.seatingCapacity !== null && attributes.seatingCapacity >= minSeatingCapacity))
					&& (minRange === null || (attributes.range !== null && attributes.range >= minRange))
					&& (!isElectric || attributes.isElectric)
			})
		},

		/**
		 * Return the current user principal as a ORGANIZER attendee object.
		 *
		 * @return {object}
		 */
		currentUserPrincipalAsAttendee() {
			return mapPrincipalObjectToAttendeeObject(
				this.principalsStore.getCurrentUserPrincipal,
				true,
			)
		},
	},

	mounted() {
		this.loadAvailability(this.resources)
	},

	methods: {
		/**
		 * The filterable attributes of a resource, from the resource metadata the
		 * server puts on its DAV principal. The seating capacity and range are null
		 * when it has none; it is electric only if it is an electric vehicle.
		 *
		 * @param {object} resource The resource principal
		 * @return {object} The attributes by filter key
		 */
		resourceAttributes(resource) {
			return {
				resourceType: resource.dav?.resourceType ?? null,
				vehicleType: resource.dav?.resourceVehicleType ?? null,
				vehicleMake: resource.dav?.resourceVehicleMake ?? null,
				vehicleModel: resource.dav?.resourceVehicleModel ?? null,
				displayName: resource.displayname ?? '',
				seatingCapacity: Number.isFinite(resource.dav?.resourceVehicleSeatingCapacity) ? resource.dav.resourceVehicleSeatingCapacity : null,
				range: Number.isFinite(resource.dav?.resourceVehicleRange) ? resource.dav.resourceVehicleRange : null,
				isElectric: Boolean(resource.dav?.resourceVehicleIsElectric),
			}
		},

		openResourceAvailability(resource) {
			this.selectedResources = [resource]
			this.showResourceAvailabilityModal = true
		},

		setShowResourceAvailabilityModal(value) {
			this.showResourceAvailabilityModal = value
		},
	},
}
</script>

<style scoped lang="scss">
.icon-close {
	display: block;
	height: 100%;
}

.modal__content {
	padding: 50px;
	//when the calendar is open, it's cut at the bottom, adding a margin fixes it
	margin-bottom: 95px;
	&__actions{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		&__select{
			width: 260px;
		}
		&__date{
			display: flex;
			justify-content: space-between;
			align-items: center;
			& > *{
				margin-inline-start: 5px;
			}
		}
	}
	&__header {
		padding: 20px;
		margin-bottom: 20px;
		h3{
			font-weight: 500;
		}
		&__attendees{
			&__user-bubble{
				margin-inline-end: 5px;
			}
		}
	}
	&__footer{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
		&__title{
			h3{
				font-weight: 500;
			}
			&__timezone{
				color: var(--color-text-lighter);
			}
		}
	}
}

:deep(.vs__search ) {
	text-overflow: ellipsis;
}

:deep(.mx-input) {
	height: 38px !important;
}

.availability {
	padding: 16px;
}
</style>

<style lang="scss">
.blocking-event-free-busy {
	// Show the blocking event above any other blocks, especially the *blocked for all* one
	z-index: 3 !important;
}

.free-busy-block {
	opacity: 0.7 !important;
}

.resources {
	&__availability {
		margin: 10px 0;
	}

	&__reserve {
		margin: 10px 0;
		margin-inline-start: 8px;
	}
}

h6 {
	margin-top: 10px;
}

.item-name {
	font-weight: bold;
}

.item-actions {
	display: flex;
	justify-content: center;
}

.name {
	opacity: .8;
}
</style>
