/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
app.filter('importErrorFilter', function () {
	'use strict';

	return function (file) {
		if (typeof file !== 'object' || !file || typeof file.errors !== 'number') {
			return '';
		}

		const all = file.progressToReach;
		const errors = (file.errors - file.duplicates);
		const duplicates = file.duplicates;
		const imported = (all - file.errors);

		//TODO - use n instead of t to use proper plurals in all translations
		if (file.errors === 0) {
			return t('calendar', 'Successfully imported {imported} objects', {imported});
		} else if(file.errors === 1) {
			if (file.duplicates === 1) {
				return t('calendar', 'Imported {imported} out of {all}, skipped one duplicate', {all, imported});
			} else {
				return t('calendar', 'Imported {imported} out of {all}, one failure', {all, imported});
			}
		} else {
			if (file.duplicates === 0) {
				return t('calendar', 'Imported {imported} out of {all}, {errors} failures', {all, errors, imported});
			} else if (file.duplicates === file.errors) {
				return t('calendar', 'Imported {imported} out of {all}, skipped {duplicates} duplicates', {all, duplicates, imported});
			} else {
				return t('calendar', 'Imported {imported} out of {all}, {errors} failures, skipped {duplicates} duplicates', {all, duplicates, errors, imported});
			}
		}
	};
});
