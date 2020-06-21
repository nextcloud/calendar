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
import { translate } from '@nextcloud/l10n'

jest.mock('@nextcloud/l10n')

describe('defaults/defaultCategories test suite', () => {

	beforeEach(() => {
		translate.mockClear()
	})

	it('should provide a default set of categories', () => {
		translate
			.mockImplementation((app, str) => str)

		expect(defaultCategories()).toEqual([
			'Anniversary',
			'Appointment',
			'Business',
			'Education',
			'Holiday',
			'Meeting',
			'Miscellaneous',
			'Non-working hours',
			'Not in office',
			'Personal',
			'Phone call',
			'Sick day',
			'Special occasion',
			'Travel',
			'Vacation',
		])

		expect(translate).toHaveBeenCalledTimes(15)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'Anniversary')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'Appointment')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'Business')
		expect(translate).toHaveBeenNthCalledWith(4, 'calendar', 'Education')
		expect(translate).toHaveBeenNthCalledWith(5, 'calendar', 'Holiday')
		expect(translate).toHaveBeenNthCalledWith(6, 'calendar', 'Meeting')
		expect(translate).toHaveBeenNthCalledWith(7, 'calendar', 'Miscellaneous')
		expect(translate).toHaveBeenNthCalledWith(8, 'calendar', 'Non-working hours')
		expect(translate).toHaveBeenNthCalledWith(9, 'calendar', 'Not in office')
		expect(translate).toHaveBeenNthCalledWith(10, 'calendar', 'Personal')
		expect(translate).toHaveBeenNthCalledWith(11, 'calendar', 'Phone call')
		expect(translate).toHaveBeenNthCalledWith(12, 'calendar', 'Sick day')
		expect(translate).toHaveBeenNthCalledWith(13, 'calendar', 'Special occasion')
		expect(translate).toHaveBeenNthCalledWith(14, 'calendar', 'Travel')
		expect(translate).toHaveBeenNthCalledWith(15, 'calendar', 'Vacation')
	})

})
