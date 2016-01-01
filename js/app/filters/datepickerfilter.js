/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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
app.filter('datepickerFilter',
	function () {
		'use strict';

		return function (item, view) {
			switch(view) {
				case 'agendaDay':
					return moment(item).format('ll');

				case 'agendaWeek':
					return t('calendar', 'Week {number} of {year}',
						{number:moment(item).week(),
							year: moment(item).week() === 1 ?
								moment(item).add(1, 'week').year() :
								moment(item).year()});

				case 'month':
					return moment(item).format('MMMM GGGG');
			}
		}
	}
);
