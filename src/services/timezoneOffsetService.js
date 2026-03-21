/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export function getTimezoneOffset(proposalDate, timezoneId){
  let timezoneOffset = 0

  try {
    const date = new Date(proposalDate)

    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneId,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const parts = dtf.formatToParts(date)

    const values = {}
    parts.forEach(({ type, value }) => {
      if (type !== 'literal') values[type] = value
    })

    const asUTC = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second)
    )

    timezoneOffset = Math.round((asUTC - date.getTime()) / 60000)
  } catch (e) {
    timezoneOffset = 0
  }

  return timezoneOffset
}
