/**
 * @copyright Copyright (c) 2022 Mikhail Sazanov
 *
 * @author Mikhail Sazanov <m@sazanof.ru>
 *
 * @license AGPL-3.0-or-later
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

/**
 * Creates a complete attachment object based on given props
 *
 * @param {object} props The attachment properties already provided
 * @return {object}
 */
const getDefaultAttachmentObject = (props = {}) => Object.assign({}, {
	// The calendar-js attachment property
	attachmentProperty: null,
	// The file name of the attachment
	fileName: null,
	// The attachment mime type
	formatType: null,
	// The uri of the attachment
	uri: null,
	// The value from calendar object
	value: null,
	// Preview of file
	xNcHasPreview: null,
	// File id in NC
	xNcFileId: null,
}, props)

/**
 * Maps a calendar-js attachment property to our attachment object
 *
 * @param {attachmentProperty} attachmentProperty The calendar-js attachmentProperty to turn into a attachment object
 * @return {object}
 */
const mapAttachmentPropertyToAttchmentObject = (attachmentProperty) => {
	return getDefaultAttachmentObject({
		attachmentProperty,
		fileName: attachmentProperty.getParameterFirstValue('FILENAME'),
		formatType: attachmentProperty.formatType,
		uri: attachmentProperty.uri,
		value: attachmentProperty.value,
		xNcHasPreview: attachmentProperty.getParameterFirstValue('X-NC-HAS-PREVIEW') === 'true',
		xNcFileId: attachmentProperty.getParameterFirstValue('X-NC-FILE-ID'),
	})
}

export {
	getDefaultAttachmentObject,
	mapAttachmentPropertyToAttchmentObject,
}
