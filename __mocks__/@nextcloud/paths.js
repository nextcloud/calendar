/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const basename = (path, extname) => {
	const normalizedPath = path
		.replace(/\\/g, '/')
		.replace(/\/+$/g, '')
		.replace(/.*\//, '')

	if (extname && extname !== normalizedPath && normalizedPath.endsWith(extname)) {
		return normalizedPath.substring(0, normalizedPath.length - extname.length)
	}

	return normalizedPath
}