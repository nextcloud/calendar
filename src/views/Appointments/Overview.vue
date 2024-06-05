<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="overview-info">
		<div class="title">
			<Avatar :user="userInfo.uid"
				:display-name="userInfo.displayName"
				:disable-tooltip="true"
				:disable-menu="true"
				:size="180" />
			<h2 class="user-info">
				{{ $t('calendar', 'Book an appointment with {name}', { name: userInfo.displayName }) }}
			</h2>
		</div>
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
				<EmptyContent :name="$t('calendar', 'No public appointments found for {name}', { name: userInfo.displayName })">
					<template #icon>
						<CalendarBlankIcon decorative />
					</template>
				</EmptyContent>
			</div>
		</div>
	</div>
</template>

<script>
import {
	NcAvatar as Avatar,
	NcEmptyContent as EmptyContent,
} from '@nextcloud/vue'
import { generateUrl } from '@nextcloud/router'
import CalendarCheckIcon from 'vue-material-design-icons/CalendarCheck.vue'
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
	padding: 8px 25px;

	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 15px;
		margin-bottom: 50px;
		background-color: var(--color-main-background);
		border-radius: var(--border-radius-large);
		color: var(--color-main-text);
		box-shadow: 0 0 10px var(--color-box-shadow);

		.user-info {
			margin-top: 20px;
		}
	}
}

.appointment-configs {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	margin: 0 -8px;

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
			background-color: var(--color-main-background);
			box-shadow: 0 0 10px var(--color-box-shadow);
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

	:deep(.empty-content) {
		margin-top: 20px;
	}
}
</style>

<style lang="scss">
#content.app-calendar {
  // Enable scrolling
  overflow: auto;

  // Fix box being cutoff at the bottom
  margin-bottom: 0;
  height: calc(var(--body-height) + var(--body-container-margin));
}
</style>
