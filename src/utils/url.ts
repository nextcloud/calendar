/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Works like urldecode() from php
 *
 * @see https://www.php.net/manual/en/function.urldecode.php
 * @param url - The url to be decoded
 * @return The decoded url
 */
export function urldecode(url: string) {
	return decodeURIComponent(url.replace(/\+/g, ' '))
}
