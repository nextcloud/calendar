/**
 * Calendar App
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

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window', 'CalendarService', 'WebCalService', 'is', 'CalendarListItem', 'Calendar', 'ColorUtility',
	function ($scope, $rootScope, $window, CalendarService, WebCalService, is, CalendarListItem, Calendar, ColorUtility) {
		'use strict';

		$scope.calendarListItems = [];
		$scope.is = is;
		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

		$scope.$watchCollection('calendars', function(newCalendars, oldCalendars) {
			newCalendars = newCalendars || [];
			oldCalendars = oldCalendars || [];

			newCalendars.filter(function(calendar) {
				return oldCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				const item = CalendarListItem(calendar);
				if (item) {
					$scope.calendarListItems.push(item);
					calendar.register(Calendar.hookFinishedRendering, function() {
						if (!$scope.$$phase) {
							$scope.$apply();
						}
					});
				}
			});

			oldCalendars.filter(function(calendar) {
				return newCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				$scope.calendarListItems = $scope.calendarListItems.filter(function(itemToCheck) {
					return itemToCheck.calendar !== calendar;
				});
			});
		});

		$scope.create = function (name, color) {
			CalendarService.create(name, color).then(function(calendar) {
				$scope.calendars.push(calendar);
				$rootScope.$broadcast('createdCalendar', calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});

			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
			angular.element('#new-calendar-button').click();
		};

		$scope.createSubscription = function(url) {
			WebCalService.get(url, true).then(function(splittedICal) {
				const color = splittedICal.color || ColorUtility.randomColor();
				const name = splittedICal.name || url;
				CalendarService.createWebCal(name, color, url)
					.then(function(calendar) {
						$scope.newSubscriptionUrl = '';
						angular.element('#new-subscription-button').click();
						$scope.calendars.push(calendar);
						$scope.$digest();
					})
					.catch(function() {
						OC.Notification.showTemporary(t('calendar', 'Error saving WebCal-calendar'));
					});
			}).catch(function(error) {
				OC.Notification.showTemporary(error);
			});
		};

		$scope.download = function (item) {
			$window.open(item.calendar.downloadUrl);
		};

		$scope.toggleSharesEditor = function (calendar) {
			calendar.toggleSharesEditor();
		};

		$scope.prepareUpdate = function (calendar) {
			calendar.prepareUpdate();
		};

		$scope.onSelectSharee = function (item, model, label, calendar) {
			// Remove content from text box
			calendar.selectedSharee = '';
			// Create a default share with the user/group, read only
			CalendarService.share(calendar, item.type, item.identifier, false, false).then(function() {
				$scope.$apply();
			});
		};

		$scope.updateExistingUserShare = function(calendar, userId, writable) {
			CalendarService.share(calendar, OC.Share.SHARE_TYPE_USER, userId, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.updateExistingGroupShare = function(calendar, groupId, writable) {
			CalendarService.share(calendar, OC.Share.SHARE_TYPE_GROUP, groupId, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromUser = function(calendar, userId) {
			CalendarService.unshare(calendar, OC.Share.SHARE_TYPE_USER, userId).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromGroup = function(calendar, groupId) {
			CalendarService.unshare(calendar, OC.Share.SHARE_TYPE_GROUP, groupId).then(function() {
				$scope.$apply();
			});
		};

		$scope.findSharee = function (val, calendar) {
			return $.get(
				OC.linkToOCS('apps/files_sharing/api/v1') + 'sharees',
				{
					format: 'json',
					search: val.trim(),
					perPage: 200,
					itemType: 'principals'
				}
			).then(function(result) {
				var users   = result.ocs.data.exact.users.concat(result.ocs.data.users);
				var groups  = result.ocs.data.exact.groups.concat(result.ocs.data.groups);

				var userShares = calendar.shares.users;
				var groupShares = calendar.shares.groups;
				var userSharesLength = userShares.length;
				var groupSharesLength = groupShares.length;
				var i, j;

				// Filter out current user
				var usersLength = users.length;
				for (i = 0 ; i < usersLength; i++) {
					if (users[i].value.shareWith === OC.currentUser) {
						users.splice(i, 1);
						break;
					}
				}

				// Now filter out all sharees that are already shared with
				for (i = 0; i < userSharesLength; i++) {
					var share = userShares[i];
					usersLength = users.length;
					for (j = 0; j < usersLength; j++) {
						if (users[j].value.shareWith === share.id) {
							users.splice(j, 1);
							break;
						}
					}
				}

				// Combine users and groups
				users = users.map(function(item){
					return {
						display: item.value.shareWith,
						type: OC.Share.SHARE_TYPE_USER,
						identifier: item.value.shareWith
					};
				});

				groups = groups.map(function(item){
					return {
						display: item.value.shareWith + ' (group)',
						type: OC.Share.SHARE_TYPE_GROUP,
						identifier: item.value.shareWith
					};
				});

				return groups.concat(users);
			});
		};

		$scope.performUpdate = function (item) {
			item.saveEditor();
			CalendarService.update(item.calendar).then(function() {
				$rootScope.$broadcast('updatedCalendar', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		/**
		 * Updates the shares of the calendar
		 */
		$scope.performUpdateShares = function (calendar) {
			CalendarService.update(calendar).then(function() {
				calendar.dropPreviousState();
				calendar.list.edit = false;
				$rootScope.$broadcast('updatedCalendar', calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.triggerEnable = function(item) {
			item.calendar.toggleEnabled();

			CalendarService.update(item.calendar).then(function() {
				$rootScope.$broadcast('updatedCalendarsVisibility', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.remove = function (item) {
			CalendarService.delete(item.calendar).then(function() {
				$scope.$parent.calendars = $scope.$parent.calendars.filter(function(elem) {
					return elem !== item.calendar;
				});
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});
		};

		$rootScope.$on('reloadCalendarList', function() {
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});
	}
]);
