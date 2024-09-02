/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateOcsUrl, generateRemoteUrl } from '@nextcloud/router'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { parseXML } from 'webdav'
import { parseUploadError } from '../utils/propfindErrorParse.js'

/**
 * Makes a share link for a given file or directory.
 *
 * @param {string} path The file path from the user's root directory. e.g. `/myfile.txt`
 * @return {string} url share link
 */
const shareFile = async function(path) {
	try {
		const res = await axios.post(generateOcsUrl('apps/files_sharing/api/v1/', 2) + 'shares', {
			shareType: OC.Share.SHARE_TYPE_LINK,
			path,
		})
		return res.data.ocs.data
	} catch (error) {
		if (error?.response?.data?.ocs?.meta?.message) {
			console.error(`Error while sharing file: ${error.response.data.ocs.meta.message}`)
			showError(error.response.data.ocs.meta.message)
			throw error
		} else {
			console.error('Error while sharing file: Unknown error')
			showError(t('calendar', 'Error while sharing file'))
			throw error
		}
	}
}

/**
 * Share file with a user with permissions
 *
 * @param path
 * @param sharedWith
 * @param permissions
 * @return {Promise<[{path: string, permissions, scope: string, name: string, backend: string, type: string},{path: string, permissions: *, scope: string, name: string, backend: string, type: string}]>}
 */
const shareFileWith = async function(path, sharedWith, permissions = 17) {
	try {
		const url = generateOcsUrl('apps/files_sharing/api/v1/', 2)
		const res = await axios.post(`${url}shares`, {
			password: null,
			shareType: OC.Share.SHARE_TYPE_USER, // WITH USERS,
			permissions, // 14 - edit, 17 - view
			path,
			shareWith: sharedWith,
		})
		return res.data.ocs.data
	} catch (error) {
		if (error?.response?.data?.ocs?.meta?.message) {
			console.error(`Error while sharing file with user: ${error.response.data.ocs.meta.message}`)
			showError(error.response.data.ocs.meta.message)
			throw error
		} else {
			console.error('Error while sharing file with user: Unknown error')
			showError(t('calendar', 'Error while sharing file with user'))
			throw error
		}
	}
}

const createFolder = async function(folderName, userId) {
	const url = generateRemoteUrl(`dav/files/${userId}/${folderName}`)
	try {
		await axios({
			method: 'MKCOL',
			url,
		})
	} catch (e) {
		if (e?.response?.status !== 405) {
			showError(t('calendar', 'Error creating a folder {folder}', {
				folder: folderName,
			}))
			// Maybe the actual upload succeeds -> keep going
			return folderName
		}

		// Folder already exists
		if (folderName !== '/') {
			folderName = await findFirstOwnedFolder(folderName, userId)
		}
	}

	return folderName
}

const findFirstOwnedFolder = async function(path, userId) {
	const infoXml = await getFileInfo(path, userId)
	const info = await parseXML(infoXml)
	const mountType = info?.multistatus?.response[0]?.propstat?.prop?.['mount-type']
	if (mountType !== 'shared') {
		return path
	}

	const hierarchy = path.split('/')
	hierarchy.pop()
	if (hierarchy.length === 1) {
		return '/'
	}

	return findFirstOwnedFolder(hierarchy.join('/'), userId)
}

const uploadLocalAttachment = async function(folder, files, dav, componentAttachments) {
	const attachments = []
	const promises = []

	files.forEach(file => {
		// temp fix, until we decide where to save the attachments
		if (componentAttachments.map(attachment => attachment.fileName.split('/').pop()).indexOf(file.name) !== -1) {
			// TODO may be show user confirmation dialog to create a file named Existing_File_(2) ?
			showError(t('calendar', 'Attachment {fileName} already exists!', {
				fileName: file.name,
			}))
		} else {
			const url = generateRemoteUrl(`dav/files/${dav.userId}/${folder}/${file.name}`)
			const res = axios.put(url, file).then(resp => {
				const data = {
					fileName: file.name,
					formatType: file.type,
					uri: url,
					value: url,
					path: `/${file.name}`,
				}
				if (resp.status === 204 || resp.status === 201) {
					showSuccess(t('calendar', 'Attachment {fileName} added!', {
						fileName: file.name,
					}))
					attachments.push(data)
				}
			}).catch(async (exception) => {
				if (exception.response) {
					const message = await parseUploadError(exception)
					if (message) {
						showError(message)
					} else {
						showError(t('calendar', 'An error occurred during uploading file {fileName}', {
							fileName: file.name,
						}))
					}
				}
			})
			promises.push(res)
		}

	})
	await Promise.all(promises)
	return attachments

}

// TODO is shared or not @share-types@
const getFileInfo = async function(path, userId) {
	const url = generateRemoteUrl(`dav/files/${userId}/${path}`)
	const res = await axios({
		method: 'PROPFIND',
		url,
		data: `<?xml version="1.0"?>
			<d:propfind
			xmlns:d="DAV:"
			xmlns:oc="http://owncloud.org/ns"
			xmlns:nc="http://nextcloud.org/ns">
				<d:prop>
					<d:getcontenttype />
					<oc:size />
					<oc:fileid />
					<oc:share-types />
					<nc:has-preview />
					<nc:mount-type />
				</d:prop>
			</d:propfind>`,
	}).catch(() => {
		showError(t('calendar', 'An error occurred during getting file information'))
	})
	return res.data
}

export {
	getFileInfo,
	shareFile,
	shareFileWith,
	uploadLocalAttachment,
	createFolder,
}
