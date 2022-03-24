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
	<div class="overview-info">
		<Avatar :user="userInfo.uid"
			:display-name="userInfo.displayName"
			:disable-tooltip="true"
			:disable-menu="true"
			:size="180" />
		<h2 class="user-info">
			{{ $t('calendar', 'Book an appointment with {name}', { name: userInfo.displayName }) }}
		</h2>
		<div class="appointment-configs">
			<template v-if="configs.length > 0">
				<div v-for="config in configs"
					:key="config.id"
					class="config">
					<a :href="linkToConfig(config)"
						class="config-link">
						<div class="header">
							<CalendarCheckIcon decorative />
							<span class="name">{{ config.name }}</span>
						</div>
						<div v-if="config.description !== ''"
							class="description">
							{{ config.description }}
						</div>
					</a>
				</div>
			</template>
			<div v-else>
				<EmptyContent>
					<template #icon>
						<CalendarBlankIcon decorative />
					</template>
					<template #desc>
						{{ $t('calendar', 'No public appointments found for {name}', { name: userInfo.displayName }) }}
					</template>
				</EmptyContent>
			</div>
		</div>
	</div>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import { generateUrl } from '@nextcloud/router'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck'
import CalendarBlankIcon from 'vue-material-design-icons/CalendarBlank.vue'

export default {
	name: 'Overview',
	components: {
		Avatar,
		EmptyContent,
		CalendarCheckIcon,
		CalendarBlankIcon,
	},
	props: {
		configs: {
			required: true,
			type: Array,
		},
		userInfo: {
			required: true,
			type: Object,
		},
	},
	methods: {
		linkToConfig(config) {
			return generateUrl('/apps/calendar/appointment/{token}', {
				token: config.token,
			})
		},
	},
}

</script>

<style lang="scss" scoped>
.overview-info {
	display: flex;
	align-items: center;
	flex-direction: column;
	max-width: 900px;
	margin: 50px auto;
	padding: 0 25px;
}

.user-info {
	color: var( --color-text-maxcontrast);
	margin-bottom: 50px;
	margin-top: 20px;
}

.appointment-configs {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;

	.config {
		display: flex;
		justify-content: center;
		width: 250px;
		padding: 8px;

		.config-link {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 16px;
			border-radius: var(--border-radius-large);
			background-color: var(--color-background-dark);
			width: 100%;

			&:hover {
				background-color: var(--color-background-hover);
			}

			.header {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;

				.material-design-icon {
					margin-right: 5px;
				}

				.name {
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
					font-weight: bold;
				}
			}
		}

		.description {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			width: 100%;
		}
	}

	::v-deep .empty-content {
		margin-top: 20px;
	}
}
</style>
