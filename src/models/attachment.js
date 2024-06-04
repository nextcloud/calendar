/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
