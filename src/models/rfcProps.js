/**
 * @copyright Copyright (c) 2018 Georg Ehrke
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

export default {
	// RFC 5545
	class: {
		name: 'accessClass',
		readableName: t('calendar', 'When shared show'),
		icon: 'icon-eye',
		options: [
			{ value: 'PUBLIC', label: t('calendar', 'When shared show full event') },
			{ value: 'CONFIDENTIAL', label: t('calendar', 'When shared show only busy') },
			{ value: 'PRIVATE', label: t('calendar', 'When shared hide this event') },
		],
		multiple: false,
		info: t('calendar', 'The visibility of this event in shared calendars.'),
		defaultValue: 'PUBLIC'
	},
	summary: {
		name: 'title',
		readableName: t('calendar', 'Title'),
		placeholder: t('calendar', 'Enter a title for this event')
	},
	location: {
		name: 'location',
		readableName: t('calendar', 'Location'),
		placeholder: t('calendar', 'Add or search for location'),
		icon: 'icon-address'
	},
	description: {
		name: 'description',
		readableName: t('calendar', 'Description'),
		placeholder: t('calendar', 'Add a description for yourself and your attendees'),
		icon: 'icon-menu',
	},
	geo: {
		name: 'geo',
		readableName: t('calendar', 'Geographic Position'),
		icon: 'icon-timezone',
		multiple: false,
		default: false,
		info: t('calendar', 'The geographical position this events take place at.')
	},
	priority: {
		readableName: t('calendar', 'Priority'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', 'Priority of this event.'),
		options: [
			{ value: 7, label: t('calendar', 'Low') },
			{ value: 5, label: t('calendar', 'Medium') },
			{ value: 3, label: t('calendar', 'High') },
		]

	},
	status: {
		name: 'status',
		readableName: t('calendar', 'Status'),
		icon: 'icon-checkmark',
		options: [
			{ value: 'CONFIRMED', label: t('calendar', 'Confirmed') },
			{ value: 'TENTATIVE', label: t('calendar', 'Tentative') },
			{ value: 'CANCELLED', label: t('calendar', 'Cancelled') },
		],
		multiple: false,
		default: true,
		info: t('calendar', 'Confirmation about the overall status of the event.'),
		defaultValue: 'CONFIRMED'
	},
	timeTransparency: {
		name: 'timeTransparency',
		readableName: t('calendar', 'Show as'),
		icon: 'icon-briefcase',
		multiple: false,
		default: true,
		info: t('calendar', 'Take this event into account when calculating free-busy information'),
		options: [
			{ value: 'TRANSPARENT', label: t('calendar', 'Free') },
			{ value: 'OPAQUE', label: t('calendar', 'Busy') },
		],
		defaultValue: 'TRANSPARENT'
	},
	// url: {
	// 	readableName: t('calendar', 'URL'),
	// 	icon: '',
	// 	multiple: false,
	// 	default: false,
	// 	info: t('calendar', '')
	// },
	// To be implemented later:
	// attach: {
	// 	readableName: t('calendar', 'Attachments'),
	// 	multiple: true,
	//
	// },
	categories: {
		readableName: t('calendar', 'Categories'),
		icon: '',
		multiple: true,
		default: true,
		info: t('calendar', '')

	},
	resources: {
		readableName: t('calendar', 'Additional resources'),
		icon: '',
		multiple: true,
		default: false,
		info: t('calendar', '')

	},
	// RFC 7986
	color: {
		readableName: t('calendar', 'Custom color'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', 'Special color of this event. Overrides the calendar-color.')
	},
	// To be implemented later:
	// conference: {
	// 	readableName: t('calendar', 'Conference system'),
	// 	icon: '',
	// 	multiple: false,
	// },
}
