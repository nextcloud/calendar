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
import { translate } from '@nextcloud/l10n'

export default () => {
	// This list was taken from https://tools.ietf.org/html/rfc5545#section-5
	return [
		translate('calendar', 'Anniversary'),
		translate('calendar', 'Appointment'),
		translate('calendar', 'Business'),
		translate('calendar', 'Education'),
		translate('calendar', 'Holiday'),
		translate('calendar', 'Meeting'),
		translate('calendar', 'Miscellaneous'),
		translate('calendar', 'Non-working hours'),
		translate('calendar', 'Not in office'),
		translate('calendar', 'Personal'),
		translate('calendar', 'Phone call'),
		translate('calendar', 'Sick day'),
		translate('calendar', 'Special occasion'),
		translate('calendar', 'Travel'),
		translate('calendar', 'Vacation'),
	]
}
