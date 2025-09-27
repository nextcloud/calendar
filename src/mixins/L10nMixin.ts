/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate, translatePlural } from '@nextcloud/l10n'

export default {
	methods: {
		t: translate,
		n: translatePlural,
		$t: translate,
		$n: translatePlural,
	},
}
