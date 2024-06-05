/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

		const categories = [
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
		]

		expect(defaultCategories()).toEqual(categories.map(category => ({
			value: category,
			label: category,
		})))

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
