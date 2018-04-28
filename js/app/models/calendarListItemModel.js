/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

app.factory('CalendarListItem', function($rootScope, $window, Calendar, WebCal, isSharingAPI) {
	'use strict';

	function CalendarListItem(calendar) {
		const context = {
			calendar: calendar,
			isEditingShares: false,
			isEditingProperties: false,
			isDisplayingCalDAVUrl: false,
			isDisplayingWebCalUrl: false,
			isSendingMail: false
		};
		const iface = {
			_isACalendarListItemObject: true
		};

		if (!Calendar.isCalendar(calendar)) {
			return null;
		}

		Object.defineProperties(iface, {
			calendar: {
				get: function() {
					return context.calendar;
				}
			},
			publicSharingURL: {
				get: () => {
					let displayname = context.calendar.displayname
						.replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
						.replace(/\-\-+/g, '-').replace(/^-+/, '')
						.replace(/-+$/, '');

					if (displayname === '') {
						return $rootScope.root + 'p/' + context.calendar.publicToken;
					} else {
						return $rootScope.root + 'p/' + context.calendar.publicToken + '/' + displayname;
					}
				}
			},
			publicRenderingURL: {
                                get: () => {
					let displayname = context.calendar.displayname
                                                .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
                                                .replace(/\-\-+/g, '-').replace(/^-+/, '')
                                                .replace(/-+$/, '');
                                        return $rootScope.root + 'p/' + context.calendar.publicToken + '/' + displayname + '/rendering';
                                }
                        },
			publicSchedulingURL: {
                                get: () => {
                                        let displayname = context.calendar.displayname
                                                .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
                                                .replace(/\-\-+/g, '-').replace(/^-+/, '')
                                                .replace(/-+$/, '');
                                        return $rootScope.root + 'p/' + context.calendar.publicToken + '/' + displayname + '/schedule';
                                }
                        },
			publicEmbedURL: {
				get: () => {
					return $rootScope.root + 'embed/' + context.calendar.publicToken;
				}
			}
		});

		iface.displayCalDAVUrl = function() {
			return context.isDisplayingCalDAVUrl;
		};

		iface.showCalDAVUrl = function() {
			context.isDisplayingCalDAVUrl = true;
		};

		iface.displayWebCalUrl = function() {
			return context.isDisplayingWebCalUrl;
		};

		iface.hideCalDAVUrl = function() {
			context.isDisplayingCalDAVUrl = false;
		};

		iface.showWebCalUrl = function() {
			context.isDisplayingWebCalUrl = true;
		};

		iface.hideWebCalUrl = function() {
			context.isDisplayingWebCalUrl = false;
		};

		iface.showSharingIcon = function() {
			const isCalendarShareable = context.calendar.isShareable();
			const isCalendarShared = context.calendar.isShared();
			const isCalendarPublishable = context.calendar.isPublishable();

			// Publishing does not depend on sharing API
			// always show sharing icon in this case
			if (isCalendarPublishable) {
				return true;
			}

			// if the sharing API was disabled, but the calendar was
			// previously shared, allow users to edit or remove
			// existing shares
			if (!isSharingAPI && isCalendarShared && isCalendarShareable) {
				return true;
			}

			return (isSharingAPI && isCalendarShareable);
		};
		

		iface.isEditingShares = function() {
			return context.isEditingShares;
		};

		iface.isSendingMail = function() {
			return context.isSendingMail;
		};

		iface.toggleEditingShares = function() {
			context.isEditingShares = !context.isEditingShares;
		};

		iface.toggleSendingMail = function() {
			context.isSendingMail = !context.isSendingMail;
		};

		iface.isEditing = function() {
			return context.isEditingProperties;
		};

		iface.displayActions = function() {
			return !iface.isEditing();
		};

		iface.displayColorIndicator = function() {
			return (!iface.isEditing() && !context.calendar.isRendering());
		};

		iface.displaySpinner = function() {
			return (!iface.isEditing() && context.calendar.isRendering());
		};

		iface.openEditor = function() {
			iface.color = context.calendar.color;
			iface.displayname = context.calendar.displayname;

			context.isEditingProperties = true;
		};

		iface.cancelEditor = function() {
			iface.color = '';
			iface.displayname = '';

			context.isEditingProperties = false;
		};

		iface.saveEditor = function() {
			context.calendar.color = iface.color;
			context.calendar.displayname = iface.displayname;

			iface.color = '';
			iface.displayname = '';

			context.isEditingProperties = false;
		};

		iface.isWebCal = function() {
			return WebCal.isWebCal(context.calendar);
		};

		iface.getOwnerName = function() {
			return context.calendar.ownerDisplayname || context.calendar.owner;
		};

		iface.getPublicDisplayname = function() {
			const searchFor = '(' + context.calendar.owner + ')';
			const lastIndexOf = context.calendar.displayname.lastIndexOf(searchFor);

			return context.calendar.displayname.substr(0, lastIndexOf - 1);
		};

		//Properties for ng-model of calendar editor
		iface.color = '';
		iface.displayname = '';

		iface.order = 0;

		iface.selectedSharee = '';

		return iface;
	}

	CalendarListItem.isCalendarListItem = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isACalendarListItemObject === true);
	};

	return CalendarListItem;
});
