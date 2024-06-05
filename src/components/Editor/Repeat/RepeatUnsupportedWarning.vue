<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="repeat-option-warning">
		<strong>
			{{ $t('calendar', 'The recurrence definition of this event is not fully supported by Nextcloud. If you edit the recurrence-options, certain recurrences may be lost.') }}
		</strong>
	</div>
</template>

<script>
export default {
	name: 'RepeatUnsupportedWarning',
}
</script>
