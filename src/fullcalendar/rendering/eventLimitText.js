/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translatePlural as n } from '@nextcloud/l10n'

/**
 * Provide the string when the event limit is hit
 *
 * @param {object} data Data destructuring object
 * @param {number} data.num Number of omitted event
 * @return {string}
 */
export default function({ num }) {
	// TODO: this is broken, because singular and plural are equal
	return n('calendar', '+%n more', '+%n more', num)
}
