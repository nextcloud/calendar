/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// SPDX-SnippetBegin
// SPDX-SnippetCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

const dtfCache = new Map()

export function getTimezoneOffset(proposalDate, timezoneId){

  try {
    const date = new Date(proposalDate)
		if (isNaN(date)) return null
		
		let dtf = dtfCache.get(timezoneId)
		if (!dtf) {
    	dtf = new Intl.DateTimeFormat('en-US', {
      	timeZone: timezoneId,
      	hour12: false,
      	year: 'numeric',
      	month: '2-digit',
      	day: '2-digit',
      	hour: '2-digit',
      	minute: '2-digit',
      	second: '2-digit',
    	})
			dtfCache.set(timezoneId, dtf)
		}

    const parts = dtf.formatToParts(date)
    const values = {}
		
    for (const { type, value } of parts) {
      if (type !== 'literal') values[type] = value
    }

    const asUTC = Date.UTC(
      +Number(values.year),
      +Number(values.month) - 1,
      +Number(values.day),
      +Number(values.hour),
      +Number(values.minute),
      +Number(values.second)
    )

    return Math.floor((asUTC - date.getTime()) / 60000)
  } catch {
    return null
  }
}
// SPDX-SnippetEnd
