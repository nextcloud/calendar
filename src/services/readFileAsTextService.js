/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Read a file object as text
 *
 * @param {File} file The file object to get contents from
 * @return {Promise<string>}
 */
export const readFileAsText = (file) => {
	const fileReader = new FileReader()

	return new Promise((resolve, reject) => {
		fileReader.onload = () => {
			resolve(fileReader.result)
		}
		fileReader.onerror = (e) => {
			reject(e)
		}

		fileReader.readAsText(file)
	})
}
