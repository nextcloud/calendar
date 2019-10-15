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

export default function getDefaultAlarms(allDay = false) {
	if (allDay) {
		return [
			9 * 60 * 60, // On the day of the event at 9am
			-15 * 60 * 60, // 1 day before at 9am
			-39 * 60 * 60, // 2 days before at 9am
			-159 * 60 * 60 // 1 week before at 9am
		]
	} else {
		return [
			0, // At the time of the event
			-5 * 60, // 5 minutes before
			-10 * 60, // 10 minutes before
			-15 * 60, // 15 minutes before
			-30 * 60, // 30 minutes before
			-1 * 60 * 60, // 1 hour before
			-2 * 60 * 60, // 2 hour before
			-1 * 24 * 60 * 60, // 1 day before
			-2 * 24 * 60 * 60 // 2 days before
		]
	}
}
