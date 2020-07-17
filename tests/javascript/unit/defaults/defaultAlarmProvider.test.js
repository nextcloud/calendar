/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import getDefaultAlarms from '../../../../src/defaults/defaultAlarmProvider.js'

describe('defaults/defaultAlarmProvider test suite', () => {

	it('should provide default alarms for timed events', () => {
		expect(getDefaultAlarms()).toEqual([
			0,
			-300,
			-600,
			-900,
			-1800,
			-3600,
			-7200,
			-86400,
			-172800,
		])
	})

	it('should provide default alarms for all-day events', () => {
		expect(getDefaultAlarms(true)).toEqual([
			32400,
			-54000,
			-140400,
			-572400,
		])
	})

})
