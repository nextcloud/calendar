/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
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

app.service('PopoverPositioningUtility', function($window) {
	'use strict';

	const context = {
		popoverHeight: 300,
		popoverWidth: 450,
	};

	Object.defineProperties(context, {
		headerHeight: {
			get: function() {
				return angular.element('#header').height();
			}
		},
		navigationWidth: {
			get: function() {
				return angular.element('#app-navigation').width();
			}
		},
		windowX: {
			get: function() {
				return $window.innerWidth - context.navigationWidth;
			}
		},
		windowY: {
			get: function() {
				return $window.innerHeight - context.headerHeight;
			}
		}
	});

	context.isAgendaDayView = function(view) {
		return view.name === 'agendaDay';
	};

	context.isAgendaView = function(view) {
		return view.name.startsWith('agenda');
	};

	context.isInTheUpperPart = function(top) {
		return ((top - context.headerHeight) / context.windowY < 0.5);
	};

	context.isInTheLeftQuarter = function(left) {
		return ((left - context.navigationWidth) / context.windowX < 0.25);
	};

	context.isInTheRightQuarter = function(left) {
		return ((left - context.navigationWidth) / context.windowX > 0.75);
	};

	/**
	 * calculate the position of a popover
	 * @param {Number} left
	 * @param {Number}top
	 * @param {Number}right
	 * @param {Number}bottom
	 * @param {*} view
	 */
	this.calculate = function(left, top, right, bottom, view) {
		const position = [],
			eventWidth = right - left;

		if (context.isInTheUpperPart(top)) {
			if (context.isAgendaView(view)) {
				position.push({
					name: 'top',
					value: top - context.headerHeight + 30
				});
			} else {
				position.push({
					name: 'top',
					value: bottom - context.headerHeight + 20
				});
			}
		} else {
			position.push({
				name: 'top',
				value: top - context.headerHeight - context.popoverHeight - 20
			});
		}

		if (context.isAgendaDayView(view)) {
			position.push({
				name: 'left',
				value: left - (context.popoverWidth / 2) - 20 + eventWidth / 2
			});
		} else {
			if (context.isInTheLeftQuarter(left)) {
				position.push({
					name: 'left',
					value: left - 20 + eventWidth / 2
				});
			} else if (context.isInTheRightQuarter(left)) {
				position.push({
					name: 'left',
					value: left - context.popoverWidth - 20 + eventWidth / 2
				});
			} else {
				position.push({
					name: 'left',
					value: left - (context.popoverWidth / 2) - 20 + eventWidth / 2
				});
			}
		}

		return position;
	};

	/**
	 * calculate the position of a popover by a given target
	 * @param {*} target
	 * @param {*} view
	 */
	this.calculateByTarget = function(target, view) {
		const clientRect = target.getClientRects()[0];

		const left = clientRect.left,
			top = clientRect.top,
			right = clientRect.right,
			bottom = clientRect.bottom;

		return this.calculate(left, top, right, bottom, view);
	};
});
