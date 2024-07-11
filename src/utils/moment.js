/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @copyright Copyright (c) 2018 John Molakvoæ
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
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
import { getFirstDay, getLanguage, getLocale } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'

/**
 *
 * @return {Promise<string>}
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
			LLLL: moment.localeData(realLocale).longDateFormat('LLLL'),
			l: moment.localeData(realLocale).longDateFormat('l'),
			ll: moment.localeData(realLocale).longDateFormat('ll'),
			lll: moment.localeData(realLocale).longDateFormat('lll'),
			llll: moment.localeData(realLocale).longDateFormat('llll'),
		},
		week: {
			dow: getFirstDay(),
			doy: moment.localeData(realLocale).firstDayOfYear(),
		},
	})

	return name
}

/**
 * Dynamically loads the requested locale and returns the actually loaded locale
 *
 * @param {string} locale Name of locale to load
 * @return {Promise<string>}
 */
async function getLocaleFor(locale) {
	// IMPORTANT: Keep each '/moment/local/...' string as is. Otherwise, webpack might not bundle
	//            locale data because the contentRegExp fails to detect any files.
	try {
		// default load e.g. en-de
		await import(`moment/locale/${locale}.js`)
		return locale
	} catch (error) {
		const splitLocale = locale.split('-')
		try {
			// failure: fallback to first part of locale, which
			// should be language
			locale = splitLocale[0]
			await import(`moment/locale/${locale}.js`)
			return locale
		} catch (e) {
			// failure, fallback to english
			console.debug('Fallback to locale', 'en')
			// English is the default locale and doesn't need to imported.
			// It is already included in moment.js.
		}
	}

	return 'en'
}
