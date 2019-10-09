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
import { translate } from 'nextcloud-l10n'

export default {
	// RFC 5545
	class: {
		name: 'accessClass',
		readableName: translate('calendar', 'When shared show'),
		icon: 'icon-eye',
		options: [
			{ value: 'PUBLIC', label: translate('calendar', 'When shared show full event') },
			{ value: 'CONFIDENTIAL', label: translate('calendar', 'When shared show only busy') },
			{ value: 'PRIVATE', label: translate('calendar', 'When shared hide this event') },
		],
		multiple: false,
		info: translate('calendar', 'The visibility of this event in shared calendars.'),
		defaultValue: 'PUBLIC'
	},
	summary: {
		name: 'title',
		readableName: translate('calendar', 'Title'),
		placeholder: translate('calendar', 'Enter a title for this event')
	},
	location: {
		name: 'location',
		readableName: translate('calendar', 'Location'),
		placeholder: translate('calendar', 'Add a location'),
		icon: 'icon-address'
	},
	description: {
		name: 'description',
		readableName: translate('calendar', 'Description'),
		placeholder: translate('calendar', 'Add a description'),
		icon: 'icon-menu',
	},
	geo: {
		name: 'geo',
		readableName: translate('calendar', 'Geographic Position'),
		icon: 'icon-timezone',
		multiple: false,
		default: false,
		info: translate('calendar', 'The geographical position this events take place at.')
	},
	priority: {
		readableName: translate('calendar', 'Priority'),
		icon: '',
		multiple: false,
		default: false,
		info: translate('calendar', 'Priority of this event.'),
		options: [
			{ value: 7, label: translate('calendar', 'Low') },
			{ value: 5, label: translate('calendar', 'Medium') },
			{ value: 3, label: translate('calendar', 'High') },
		]

	},
	status: {
		name: 'status',
		readableName: translate('calendar', 'Status'),
		icon: 'icon-checkmark',
		options: [
			{ value: 'CONFIRMED', label: translate('calendar', 'Confirmed') },
			{ value: 'TENTATIVE', label: translate('calendar', 'Tentative') },
			{ value: 'CANCELLED', label: translate('calendar', 'Cancelled') },
		],
		multiple: false,
		default: true,
		info: translate('calendar', 'Confirmation about the overall status of the event.'),
		defaultValue: 'CONFIRMED'
	},
	timeTransparency: {
		name: 'timeTransparency',
		readableName: translate('calendar', 'Show as'),
		icon: 'icon-briefcase',
		multiple: false,
		default: true,
		info: translate('calendar', 'Take this event into account when calculating free-busy information'),
		options: [
			{ value: 'TRANSPARENT', label: translate('calendar', 'Free') },
			{ value: 'OPAQUE', label: translate('calendar', 'Busy') },
		],
		defaultValue: 'TRANSPARENT'
	},
	// url: {
	// 	readableName: translate('calendar', 'URL'),
	// 	icon: '',
	// 	multiple: false,
	// 	default: false,
	// 	info: translate('calendar', '')
	// },
	// To be implemented later:
	// attach: {
	// 	readableName: translate('calendar', 'Attachments'),
	// 	multiple: true,
	//
	// },
	categories: {
		readableName: translate('calendar', 'Categories'),
		icon: '',
		multiple: true,
		default: true,
		info: translate('calendar', '')

	},
	resources: {
		readableName: translate('calendar', 'Additional resources'),
		icon: '',
		multiple: true,
		default: false,
		info: translate('calendar', '')

	},
	// RFC 7986
	color: {
		readableName: translate('calendar', 'Custom color'),
		icon: '',
		multiple: false,
		default: false,
		info: translate('calendar', 'Special color of this event. Overrides the calendar-color.')
	},
	// To be implemented later:
	// conference: {
	// 	readableName: translate('calendar', 'Conference system'),
	// 	icon: '',
	// 	multiple: false,
	// },
}
