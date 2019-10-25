/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 * @copyright Copyright (c) 2018 John Molakvoæ
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
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
import { getLanguage, getLocale } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 *
 * @returns {Promise<string>}
 */
export default async function loadMomentLocalization() {
	const locale = getLocale().replace('_', '-').toLowerCase()
	const language = getLanguage().replace('_', '-').toLowerCase()

	if (locale === language) {
		return getLocaleFor(locale)
	}

	const [realLocale, realLanguage] = await Promise.all([getLocaleFor(locale), getLocaleFor(language)])
	if (realLocale === realLanguage) {
		return realLocale
	}

	const name = `nextcloud-calendar-fake-locale-${realLocale}-${realLanguage}`
	moment.defineLocale(name, {
		parentLocale: realLanguage,
		longDateFormat: {
			LT: moment.localeData(realLocale).longDateFormat('LT'),
			LTS: moment.localeData(realLocale).longDateFormat('LTS'),
			L: moment.localeData(realLocale).longDateFormat('L'),
			LL: moment.localeData(realLocale).longDateFormat('LL'),
			LLL: moment.localeData(realLocale).longDateFormat('LLL'),
			LLLL: moment.localeData(realLocale).longDateFormat('LLLL')
		},
		week: {
			dow: moment.localeData(realLocale).firstDayOfWeek(),
			doy: moment.localeData(realLocale).firstDayOfYear()
		}
	})

	return name
}

/**
 * Dynamically loads the requested locale and returns the actually loaded locale
 *
 * @param {String} locale Name of locale to load
 * @returns {Promise<string>}
 */
async function getLocaleFor(locale) {
	try {
		// default load e.g. fr-fr
		await import('moment/locale/' + locale)
		return locale
	} catch (error) {
		try {
			// failure: fallback to fr
			locale = locale.split('-')[0]
			await import('moment/locale/' + locale)
			return locale
		} catch (e) {
			// failure, fallback to english
			console.debug('Fallback to locale', 'en')
		}
	}

	return 'en'
}
