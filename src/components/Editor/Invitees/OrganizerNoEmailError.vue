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
	<div class="editor-invitee-list-no-email-configured-message">
		<div class="editor-invitee-list-no-email-configured-message__icon">
			@
		</div>
		<div class="editor-invitee-list-no-email-configured-message__caption">
			{{ $t('calendar', 'Please configure your email-address in the personal settings. It is necessary to send out invitations and handle responses of your invitees.') }}
		</div>
	</div>
</template>

<script>
export default {
	name: 'OrganizerNoEmailError',
}
</script>
