/**
 * Calendar App
 *
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Georg Ehrke
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { translate as t } from '@nextcloud/l10n'

export default () => {
	// This list was taken from https://tools.ietf.org/html/rfc5545#section-5
	return [
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
}
