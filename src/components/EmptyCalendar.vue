<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
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
	<div class="empty-calendar-screen">
		<div class="empty-calendar-screen__icon">
			<div class="icon icon-calendar-dark" />
		</div>
		<div class="empty-calendar-screen__message">
			<h2>
				{{ $t('calendar', 'Public calendar does not exist') }}
			</h2>
			<p>
				{{ $t('calendar', 'Maybe the share was deleted or has expired?' )}}
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: 'EmptyCalendar'
}
</script>
