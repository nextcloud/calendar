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

/**
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window', 'HashService', 'CalendarService', 'WebCalService', 'is', 'CalendarListItem', 'Calendar', 'MailerService', 'ColorUtility', 'isSharingAPI', 'constants',
	function ($scope, $rootScope, $window, HashService, CalendarService, WebCalService, is, CalendarListItem, Calendar, MailerService, ColorUtility, isSharingAPI, constants) {
		'use strict';

		$scope.calendarListItems = [];
		$scope.is = is;
		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';
		$scope.addingCal = false;
		$scope.addingCalRequest = false;
		$scope.addingSub = false;
		$scope.addingSubRequest = false;

		$scope.subscription = {};
		$scope.subscription.newSubscriptionUrl = '';
		$scope.subscription.newSubscriptionLocked = false;
		$scope.publicdav = 'CalDAV';
		$scope.publicdavdesc = t('calendar', 'CalDAV address for clients');
		$scope.warningLabel = t('calendar', 'Some events in this calendar are broken. Please check the JS console for more info.');
		$scope.shareLabel = t('calendar', 'Share Calendar');
		$scope.sharedLabel = t('calendar', 'Shared');

		$scope.isSharingAPI = isSharingAPI;
		$scope.canSharePublicLink = constants.canSharePublicLink;

		$scope.$watchCollection('calendars', function(newCalendars, oldCalendars) {
			newCalendars = newCalendars || [];
			oldCalendars = oldCalendars || [];

			newCalendars.filter(function(calendar) {
				return oldCalendars.indexOf(calendar) === -1;
			}).forEach(function(calendar) {
				const item = CalendarListItem(calendar);
				if (item) {
					$scope.calendarListItems.push(item);
					$scope.publicdavurl = $scope.$parent.calendars[0].caldav;
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

		$scope.openNewCalendarForm = () => {
			$scope.addingCal = true;
		};

		$scope.dismissNewCalendar = () => {
			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
			$scope.addingCal = false;
		};

		$scope.create = function (name) {
			$scope.addingCalRequest = true;
			const color = ColorUtility.randomColor();
			CalendarService.create(name, color).then(function(calendar) {
				$scope.calendars.push(calendar);
				$rootScope.$broadcast('createdCalendar', calendar);

				$scope.newCalendarInputVal = '';
				$scope.newCalendarColorVal = '';
				$scope.addingCal = false;
				$scope.addingCalRequest = false;
				$scope.$apply();
			});
		};

		$scope.openNewSubscriptionForm = () => {
			$scope.addingSub = true;
		};

		$scope.dismissNewSubscription = () => {
			$scope.subscription.newSubscriptionUrl = '';
			$scope.addingSub = false;
		};

		$scope.createSubscription = function(url) {
			$scope.subscription.newSubscriptionLocked = true;
			WebCalService.get(url).then(function(splittedICal) {
				const color = splittedICal.color || ColorUtility.randomColor();
				let name = splittedICal.name || url;

				if (name.length > 100) {
					name = name.substr(0, 100);
				}

				CalendarService.createWebCal(name, color, url)
					.then(function(calendar) {
						angular.element('#new-subscription-button').click();
						$scope.calendars.push(calendar);
						$scope.subscription.newSubscriptionUrl = '';
						$scope.$digest();
						$scope.$parent.$digest();
						$scope.subscription.newSubscriptionLocked = false;
						$scope.addingSub = false;
					})
					.catch(function() {
						OC.Notification.showTemporary(t('calendar', 'Could not save WebCal-calendar'));
						$scope.subscription.newSubscriptionLocked = false;
					});
			}).catch(function(reason) {
				if (reason.error) {
					OC.Notification.showTemporary(reason.message);
					$scope.subscription.newSubscriptionLocked = false;
				} else if(reason.redirect) {
					$scope.createSubscription(reason.new_url);
				}
			});
		};

		$scope.download = function (item) {
			$window.open(item.calendar.downloadUrl);
		};

		$scope.integration = function (item) {
			return '<iframe width="400" height="215" src="' + item.publicEmbedURL + '"></iframe>';
		};

		$scope.$watch('publicdav', function (newvalue) {
			if ($scope.$parent.calendars[0]) {
				if (newvalue === 'CalDAV') { // CalDAV address
					$scope.publicdavurl = $scope.$parent.calendars[0].caldav;
					$scope.publicdavdesc = t('calendar', 'CalDAV address for clients');
				} else { // WebDAV address
					var url = $scope.$parent.calendars[0].url;
					// cut off last slash to have a fancy name for the ics
					if (url.slice(url.length - 1) === '/') {
						url = url.slice(0, url.length - 1);
					}
					url += '?export';
					$scope.publicdavurl = $window.location.origin + url;
					$scope.publicdavdesc = t('calendar', 'WebDAV address for subscriptions');
				}
			}
		});

		$scope.sendMail = function (item) {
			item.toggleSendingMail();
			MailerService.sendMail(item.email, item.publicSharingURL, item.calendar.displayname).then(function (response) {
				if (response.status === 200) {
					item.email = '';
					OC.Notification.showTemporary(t('calendar', 'Email sent.'));
				} else {
					OC.Notification.showTemporary(t('calendar', 'Could not send your email.'));
				}
			});
		};

		$scope.goPublic = function (item) {
			$window.open(item.publicSharingURL);
		};

		$scope.toggleSharesEditor = function (calendar) {
			calendar.toggleSharesEditor();
		};

		$scope.togglePublish = function(item) {
			if (item.calendar.published) {
				item.calendar.publish().then(function (response) {
					if (response) {
						CalendarService.get(item.calendar.url).then(function (calendar) {
							item.calendar.publicToken = calendar.publicToken;
							item.calendar.published = true;
						});
					}
					$scope.$apply();
				});
			} else {
				item.calendar.unpublish().then(function (response) {
					if (response) {
						item.calendar.published = false;
					}
					$scope.$apply();
				});
			}
		};

		$scope.prepareUpdate = function (calendar) {
			calendar.prepareUpdate();
		};

		$scope.onSelectSharee = function (item, model, label, calendarItem) {
			const calendar = calendarItem.calendar;
			// Create a default share with the user/group, read only
			calendar.share(item.type, item.identifier, item.displayname, false, false).then(function() {
				// Remove content from text box
				calendarItem.selectedSharee = '';

				$scope.$apply();
			});
		};

		$scope.updateExistingUserShare = function(calendar, userId, displayname, writable) {
			calendar.share(constants.SHARE_TYPE_USER, userId, displayname, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.updateExistingGroupShare = function(calendar, groupId, displayname, writable) {
			calendar.share(constants.SHARE_TYPE_GROUP, groupId, displayname, writable, true).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromUser = function(calendar, userId) {
			calendar.unshare(constants.SHARE_TYPE_USER, userId).then(function() {
				$scope.$apply();
			});
		};

		$scope.unshareFromGroup = function(calendar, groupId) {
			calendar.unshare(constants.SHARE_TYPE_GROUP, groupId).then(function() {
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
						display: _.escape(item.label),
						displayname: item.label,
						type: constants.SHARE_TYPE_USER,
						identifier: item.value.shareWith
					};
				});

				groups = groups.map(function(item){
					return {
						display: _.escape(item.label + ' (' + t('calendar', 'group') + ')'),
						displayname: item.label,
						type: constants.SHARE_TYPE_GROUP,
						identifier: item.value.shareWith
					};
				});

				return groups.concat(users);
			});
		};

		$scope.performUpdate = function (item) {
			item.saveEditor();
			item.calendar.update().then(function() {
				$rootScope.$broadcast('updatedCalendar', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		/**
		 * Updates the shares of the calendar
		 */
		$scope.performUpdateShares = function (calendar) {
			calendar.update().then(function() {
				calendar.dropPreviousState();
				calendar.list.edit = false;
				$rootScope.$broadcast('updatedCalendar', calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.triggerEnable = function(item) {
			item.calendar.toggleEnabled();

			item.calendar.update().then(function() {
				$rootScope.$broadcast('updatedCalendarsVisibility', item.calendar);
				$rootScope.$broadcast('reloadCalendarList');
			});
		};

		$scope.remove = function (item) {
			item.calendar.delete().then(function() {
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

		HashService.runIfApplicable('subscribe_to_webcal', (map) => {
			if (map.has('url')) {
				const url = map.get('url');

				$scope.subscription.newSubscriptionUrl = url;
				$scope.subscription.newSubscriptionLocked = true;
				angular.element('#new-subscription-button').click();

				//  wait for calendars to be initialized
				// needed for creating a proper URL
				$scope.calendarsPromise.then(() => {
					$scope.createSubscription(url);
				});
			}
		});
	}
]);
