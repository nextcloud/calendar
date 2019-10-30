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
import defaultCategories from '../../../../src/defaults/defaultCategories.js'

describe('defaults/defaultCategories test suite', () => {

	it('should provide a default set of categories', () => {
		expect(defaultCategories()).toEqual([
			'TRANSLATED:Anniversary',
			'TRANSLATED:Appointment',
			'TRANSLATED:Business',
			'TRANSLATED:Education',
			'TRANSLATED:Holiday',
			'TRANSLATED:Meeting',
			'TRANSLATED:Miscellaneous',
			'TRANSLATED:Non-working hours',
			'TRANSLATED:Not in office',
			'TRANSLATED:Personal',
			'TRANSLATED:Phone call',
			'TRANSLATED:Sick day',
			'TRANSLATED:Special occasion',
			'TRANSLATED:Travel',
			'TRANSLATED:Vacation',
		])
	})

})
