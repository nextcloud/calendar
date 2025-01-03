/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getRFCProperties } from '../../../../src/models/rfcProps.js'
import { translate } from '@nextcloud/l10n'
import { getDefaultCategories } from '../../../../src/defaults/defaultCategories.js'
jest.mock('@nextcloud/l10n')
jest.mock('../../../../src/defaults/defaultCategories.js')

describe('Test suite: RFC properties (models/rfcProps.js)', () => {

	beforeEach(() => {
		translate.mockClear()
		getDefaultCategories.mockClear()

		translate
			.mockImplementation((app, str) => str)
		getDefaultCategories
			.mockReturnValue(['Category 1', 'Category 2', 'Category 3'])
	})

	it('should provide property info for rfc properties', () => {
		const rfcProps = getRFCProperties()

		expect(rfcProps.accessClass).toEqual(expect.any(Object))
		expect(rfcProps.accessClass.readableName).toEqual('When shared show')
		expect(rfcProps.accessClass.icon).toEqual('Eye')
		expect(rfcProps.accessClass.multiple).toEqual(false)
		expect(rfcProps.accessClass.info).toEqual('The visibility of this event in shared calendars.')
		expect(rfcProps.accessClass.defaultValue).toEqual('PUBLIC')
		expect(rfcProps.accessClass.options).toEqual([
			{value: 'PUBLIC', label: 'When shared show full event'},
			{value: 'CONFIDENTIAL', label: 'When shared show only busy'},
			{value: 'PRIVATE', label: 'When shared hide this event'},
		])

		expect(rfcProps.location).toEqual(expect.any(Object))
		expect(rfcProps.location.readableName).toEqual('Location')
		expect(rfcProps.location.placeholder).toEqual('Add a location')
		expect(rfcProps.location.icon).toEqual('MapMarker')
		expect(rfcProps.location.defaultNumberOfRows).toEqual(undefined)

		expect(rfcProps.description).toEqual(expect.any(Object))
		expect(rfcProps.description.readableName).toEqual('Description')
		expect(rfcProps.description.placeholder).toEqual('Add a description\n'
			+ '\n'
			+ '- What is this meeting about\n'
			+ '- Agenda items\n'
			+ '- Anything participants need to prepare')
		expect(rfcProps.description.icon).toEqual('TextBoxOutline')
		expect(rfcProps.description.defaultNumberOfRows).toEqual(2)

		expect(rfcProps.status).toEqual(expect.any(Object))
		expect(rfcProps.status.readableName).toEqual('Status')
		expect(rfcProps.status.icon).toEqual('Check')
		expect(rfcProps.status.multiple).toEqual(false)
		expect(rfcProps.status.info).toEqual('Confirmation about the overall status of the event.')
		expect(rfcProps.status.defaultValue).toEqual('CONFIRMED')
		expect(rfcProps.status.options).toEqual([
			{ value: 'CONFIRMED', label: 'Confirmed' },
			{ value: 'TENTATIVE', label: 'Tentative' },
			{ value: 'CANCELLED', label: 'Canceled' },
		])

		expect(rfcProps.timeTransparency).toEqual(expect.any(Object))
		expect(rfcProps.timeTransparency.readableName).toEqual('Show as')
		expect(rfcProps.timeTransparency.icon).toEqual('Briefcase')
		expect(rfcProps.timeTransparency.multiple).toEqual(false)
		expect(rfcProps.timeTransparency.info).toEqual('Take this event into account when calculating free-busy information.')
		expect(rfcProps.timeTransparency.defaultValue).toEqual('TRANSPARENT')
		expect(rfcProps.timeTransparency.options).toEqual([
			{ value: 'TRANSPARENT', label: 'Free' },
			{ value: 'OPAQUE', label: 'Busy' },
		])

		expect(rfcProps.categories).toEqual(expect.any(Object))
		expect(rfcProps.categories.readableName).toEqual('Categories')
		expect(rfcProps.categories.icon).toEqual('Tag')
		expect(rfcProps.categories.multiple).toEqual(true)
		expect(rfcProps.categories.info).toEqual('Categories help you to structure and organize your events.')
		expect(rfcProps.categories.placeholder).toEqual('Search or add categories')
		expect(rfcProps.categories.tagPlaceholder).toEqual('Add this as a new category')
		expect(rfcProps.categories.options).toEqual(['Category 1', 'Category 2', 'Category 3'])

		expect(rfcProps.color).toEqual(expect.any(Object))
		expect(rfcProps.color.readableName).toEqual('Custom color')
		expect(rfcProps.color.multiple).toEqual(false)
		expect(rfcProps.color.icon).toEqual('EyedropperVariant')
		expect(rfcProps.color.info).toEqual('Special color of this event. Overrides the calendar-color.')

		// expect(translate).toHaveBeenCalledTimes(10)
		expect(translate).toHaveBeenNthCalledWith(1, 'calendar', 'When shared show')
		expect(translate).toHaveBeenNthCalledWith(2, 'calendar', 'When shared show full event')
		expect(translate).toHaveBeenNthCalledWith(3, 'calendar', 'When shared show only busy')
		expect(translate).toHaveBeenNthCalledWith(4, 'calendar', 'When shared hide this event')
		expect(translate).toHaveBeenNthCalledWith(5, 'calendar', 'The visibility of this event in shared calendars.')

		expect(translate).toHaveBeenNthCalledWith(6, 'calendar', 'Location')
		expect(translate).toHaveBeenNthCalledWith(7, 'calendar', 'Add a location')

		expect(translate).toHaveBeenNthCalledWith(8, 'calendar', 'Description')
		expect(translate).toHaveBeenNthCalledWith(9, 'calendar', 'Add a description\n'
			+ '\n'
			+ '- What is this meeting about\n'
			+ '- Agenda items\n'
			+ '- Anything participants need to prepare')

		expect(translate).toHaveBeenNthCalledWith(10, 'calendar', 'Status')
		expect(translate).toHaveBeenNthCalledWith(11, 'calendar', 'Confirmed')
		expect(translate).toHaveBeenNthCalledWith(12, 'calendar', 'Tentative')
		expect(translate).toHaveBeenNthCalledWith(13, 'calendar', 'Canceled')
		expect(translate).toHaveBeenNthCalledWith(14, 'calendar', 'Confirmation about the overall status of the event.')

		expect(translate).toHaveBeenNthCalledWith(15, 'calendar', 'Show as')
		expect(translate).toHaveBeenNthCalledWith(16, 'calendar', 'Take this event into account when calculating free-busy information.')
		expect(translate).toHaveBeenNthCalledWith(17, 'calendar', 'Free')
		expect(translate).toHaveBeenNthCalledWith(18, 'calendar', 'Busy')

		expect(translate).toHaveBeenNthCalledWith(19, 'calendar', 'Categories')
		expect(translate).toHaveBeenNthCalledWith(20, 'calendar', 'Categories help you to structure and organize your events.')
		expect(translate).toHaveBeenNthCalledWith(21, 'calendar', 'Search or add categories')
		expect(translate).toHaveBeenNthCalledWith(22, 'calendar', 'Add this as a new category')

		expect(translate).toHaveBeenNthCalledWith(23, 'calendar', 'Custom color')
		expect(translate).toHaveBeenNthCalledWith(24, 'calendar', 'Special color of this event. Overrides the calendar-color.')
	})

})
