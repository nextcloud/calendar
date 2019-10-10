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

export default {
	allDayEvents: [
		{
			label: translate('calendar', 'On the day of the event at 9am'),
			trigger: 9 * 60 * 60
		},
		{
			label: translate('calendar', '1 day before at 9am'),
			trigger: -15 * 60 * 60
		},
		{
			label: translate('calendar', '2 days before at 9am'),
			trigger: -39 * 60 * 60
		},
		{
			label: translate('calendar', '1 week before at 9am'),
			trigger: -153 * 60 * 60
		}
	],
	timedEvents: [
		{
			label: translate('calendar', 'At the time of the event'),
			trigger: 0
		},
		{
			label: translate('calendar', '5 minutes before'),
			trigger: -5 * 60
		},
		{
			label: translate('calendar', '10 minutes before'),
			trigger: -10 * 60
		},
		{
			label: translate('calendar', '15 minutes before'),
			trigger: -15 * 60
		},
		{
			label: translate('calendar', '30 minutes before'),
			trigger: -30 * 60
		},
		{
			label: translate('calendar', '1 hour before'),
			trigger: -1 * 60 * 60
		},
		{
			label: translate('calendar', '2 hours before'),
			trigger: -2 * 60 * 60
		},
		{
			label: translate('calendar', '1 day before'),
			trigger: -1 * 24 * 60 * 60
		},
		{
			label: translate('calendar', '2 days before'),
			trigger: -2 * 24 * 60 * 60
		}
	]
}
