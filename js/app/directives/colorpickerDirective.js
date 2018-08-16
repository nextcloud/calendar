/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2016 John Molakvoæ <fremulon@protonmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */
/**
 * Directive: Colorpicker
 * Description: Colorpicker for the Calendar app.
 */
app.directive('colorpicker', function(ColorUtility) {
	'use strict';

	return {
		scope: {
			selected: '=',
			customizedColors: '=colors'
		},
		restrict: 'AE',
		templateUrl: OC.filePath('calendar', 'templates', 'colorpicker.html'),
		link: function(scope, element, attr) {
			scope.colors = scope.customizedColors || ColorUtility.colors;
			scope.selected = scope.selected || scope.colors[0];
			scope.random = "#000000";

			const inputElement = document.createElement('input');
			inputElement.setAttribute('type', 'color');
			scope.supportsColorPicker = (inputElement.type === 'color');

			scope.randomizeColour = function() {
				scope.random = ColorUtility.randomColor();
				scope.pick(scope.random);
			};

			scope.pick = function(color) {
				scope.selected = color;
			};

		}
	};

});
