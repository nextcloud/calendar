/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
app.controller('EventsModalController', ['$scope', '$routeParams', 'Restangular', 'CalendarModel', 'TimezoneModel', 'EventsModel', 'DialogModel', 'Model',
	function ($scope, $routeParams, Restangular, CalendarModel, TimezoneModel, EventsModel, DialogModel, Model) {
		
		$scope.eventsmodel = EventsModel;

		$scope.$watch('eventsmodel.eventobject', function (newval, oldval) {
			if (newval.event !== '') {
				$scope.eventstitle = newval.title;
				$scope.eventslocation = newval.location;
				$scope.eventscategories = newval.categories;
				$scope.eventsdescription = newval.description;
			}
		});

		// First Day Dropdown
		$scope.recurrenceSelect = [
			{ val: t('calendar', 'Daily'), id: '0' },
			{ val: t('calendar', 'Weekly'), id: '1' },
			{ val: t('calendar', 'Monthly'), id: '2' },
			{ val: t('calendar', 'Yearly'), id: '3' },
			{ val: t('calendar', 'Other'), id: '4' }
		];

		$scope.changerecurrence = function (id) {
			if (id==='4') {
				EventsModel.getrecurrencedialog('#repeatdialog');
			}
		};
	}
]);