/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translate as t } from '@nextcloud/l10n'

/**
 *
 */
export function getDefaultCategories() {
	// This list was taken from https://tools.ietf.org/html/rfc5545#section-5
	const values = [
		t('calendar', 'Anniversary'),
		t('calendar', 'Appointment'),
		t('calendar', 'Business'),
		t('calendar', 'Education'),
		t('calendar', 'Holiday'),
		t('calendar', 'Meeting'),
		t('calendar', 'Miscellaneous'),
		t('calendar', 'Non-working hours'),
		t('calendar', 'Not in office'),
		t('calendar', 'Personal'),
		t('calendar', 'Phone call'),
		t('calendar', 'Sick day'),
		t('calendar', 'Special occasion'),
		t('calendar', 'Travel'),
		t('calendar', 'Vacation'),
	]
	return values.map(value => ({ value, label: value }))
}

export default getDefaultCategories
