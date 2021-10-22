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
		<Avatar
			:user="userInfo.uid"
			:display-name="userInfo.displayName"
			:disable-tooltip="true"
			:disable-menu="true"
			:size="180" />
		<div class="user-info">
			<strong> {{ userInfo.displayName }} </strong>
		</div>
		<div class="config-info">
			<a v-for="config in configs"
				:key="config.id"
				target="#"
				class="config-name">
				<p> <strong>{{ config.name }} </strong> </p>
				<span class="icon-arrow-right" />
			</a>
		</div>
		<div v-if="configs.length === 0">
			<EmptyContent icon="icon-calendar-dark" />
			{{ $t('calendar', 'No public appointments found for {displayname}', { displayname: userInfo.displayName }) }}
		</div>
	</div>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'

export default {
	name: 'Overview',
	components: {
		Avatar,
	  EmptyContent,
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
}

</script>
<style lang="scss" scoped>
.overview-info {
	display: flex;
	align-items: center;
	flex-direction: column;
	max-width: 900px;
	margin: 50px auto;
	height: 150px;
}

.config-info {
	display: flex;
	flex-wrap: wrap;
	max-width: 500px;
	width: 100%;
}

.config-name:hover {
	background-color: var(--color-background-hover);
	border-radius: 16px;
}

.config-name {
	display: flex;
	flex: 1 auto;
	margin-left: 40px;
	font-size: 16px;
	align-items: center;
}

.icon-arrow-right {
	background-image: var(--icon-triangle-e-000);
	margin-left: 10px;
}

.user-info {
	color: var( --color-text-maxcontrast);
	margin-bottom: 50px;
	margin-top: 20px;
}
</style>
