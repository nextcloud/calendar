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

export const properties = {
	// RFC 5545
	class: {
		readableName: t('calendar', 'When shared show'),
		icon: 'icon-share',
		options: {

		},
		multiple: false,
		default: true,
		info: t('calendar', '')
	},
	description: {
		readableName: t('calendar', 'Description'),
		icon: 'icon-text',
		multiple: false,
		default: true,
		info: t('calendar', '')
	},
	geo: {
		readableName: t('calendar', 'Geographic Position'),
		icon: 'icon-timezone',
		multiple: false,
		default: false,
		info: t('calendar', '')
	},
	priority: {
		readableName: t('calendar', 'Priority'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', ''),
		options: [
			{ value: 7, label: t('calendar', 'low') },
			{ value: 5, label: t('calendar', 'medium') },
			{ value: 3, label: t('calendar', 'high') },
		]

	},
	status: {
		readableName: t('calendar', 'Status'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', '')

	},
	transp: {
		readableName: t('calendar', 'Show as'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', ''),
		options: [
			{ value: 'TRANSPARENT', label: t('calendar', 'free') },
			{ value: 'OPAQUE', label: t('calendar', 'busy') },
		]
	},
	url: {
		readableName: t('calendar', 'URL'),
		icon: '',
		multiple: false,
		default: false,
		info: t('calendar', '')
	},
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
		info: t('calendar', '')
	},
	// To be implemented later:
	// conference: {
	// 	readableName: t('calendar', 'Conference system'),
	// 	icon: '',
	// 	multiple: false,
	// },
}
