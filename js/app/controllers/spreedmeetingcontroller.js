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

app.controller('SpreedMeetingController', ['$scope', '$http', '$q', '$timeout', function($scope, $http, $q, $timeout) {
	'use strict';

	var spreedAppBase = 'apps/spreed';

	var getURL = function(path) {
		return document.location.origin + OC.generateUrl(path);
	};

	var getAppURL = function(path) {
		return getURL(spreedAppBase + '/' + path);
	};

	var getRoomURL = function(token) {
		if (!token) {
			return null;
		}
		return getURL('call/' + token);
	};

	var getCurrentRoomURL = $scope.getCurrentRoomURL = function() {
		return getRoomURL(getRoomToken());
	};

	var getNewRoomToken = function() {
		return $http({
			method: 'POST',
			url: OC.linkToOCS(spreedAppBase + '/api/v1', 2) + 'room',
			format: 'json',
			data: {
				// We internally store the room type as a string -> convert back to an int
				roomType: parseInt($scope.properties.spreedmeeting.parameters.type, 10),
			},
		}).then(function(res) {
			var token = res.data.ocs.data.token;
			return token;
		}, function() {
			// TODO(leon): Maybe pass / annotate error
		});
	};

	var getRoomToken = function() {
		return $scope.properties.spreedmeeting.parameters.token;
	};

	var setRoomToken = function(token) {
		$scope.properties.spreedmeeting.parameters.token = token || ''; // token must be a string
		updateProperties();
	};

	var archiveRoom = function(token) {
		// TODO(leon): Notify backend to archive room
		var deferred = $q.defer()
		deferred.resolve();
		return deferred.promise;
	};

	var updateProperties = function() {
		$scope.properties.url = {
			value: getCurrentRoomURL() || '', // value must be a string
		};
	};

	var decorateAttendees = function(attendees) {
		var token = getRoomToken();
		var decorate = function(email) {
			// TODO(leon): Each participant should get an unique room PIN
		};

		var ps = [];
		attendees.forEach(function(a, i) {
			var email = a.value.replace("MAILTO:", "");
			if (!email) {
				return;
			}
			ps.push(decorate(email));
		});
		return $q.all(ps);
	};

	var attendeeRoles = {
		GUEST: 'guest',
		MODERATOR: 'moderator',
	};
	var defaultAttendeeRole = attendeeRoles.GUEST;
	$scope.properties.attendeeRoles = [
		{displayname: t('calendar', 'Guest'), val: attendeeRoles.GUEST},
		{displayname: t('calendar', 'Moderator'), val: attendeeRoles.MODERATOR},
	];
	// Set default attendee meeting role
	var setDefaultAttendeeMeetingRole = function(attendees) {
		if (!attendees) {
			return;
		}
		attendees.forEach(function(a, i) {
			if (!a.parameters.spreedmeetingrole) {
				a.parameters.spreedmeetingrole = defaultAttendeeRole;
			}
		});
	};
	$scope.$watchCollection('properties.attendee', function(n, o) {
		setDefaultAttendeeMeetingRole(n);
	});

	// Stolen from Spreed app, spreed/lib/Room.php
	// Type values must be strings, for whatever reason using ints doesn't issue a PUT request
	var meetingTypes = {
		// ONE_TO_ONE_CALL: '1',
		// GROUP_CALL: '2', // We don't support group calls (a "group" is a Nextcloud" user group)
		PUBLIC_CALL: '3',
	};
	var defaultMeetingType = meetingTypes.PUBLIC_CALL; // TODO(leon): Make this 'private' by default again once we have support for that
	$scope.properties.meetingTypes = [
		// TODO(leon): Reeable once we support other types of meetings
		// {displayname: t('calendar', 'Private'), val: meetingTypes.ONE_TO_ONE_CALL},
		// TODO(leon): What to do about type 2?
		{displayname: t('calendar', 'Public'), val: meetingTypes.PUBLIC_CALL},
	];

	// TODO(leon): This is shitty, but how to do it better?
	$scope.properties.spreedmeeting = $scope.properties.spreedmeeting || {
		value: 'nonempty', // NOTE(leon): This must not evaluate to false, else the whole property is ignored
		parameters: {
			token: '',
			type: defaultMeetingType,
		},
	};
	angular.extend($scope.properties, {
		// We have a meeting if we have a token
		doScheduleMeeting: !!getRoomToken(),
	});

	// This function might be undefined if this controller is used from a directive
	// TODO(leon): How to properly handle this in Angular?
	if ($scope.$parent.registerPostHook) {
		$scope.$parent.registerPostHook(function() {
			var deferred = $q.defer();

			if (!$scope.properties.doScheduleMeeting) {
				// We don't want to create a meeting
				var token = getRoomToken();
				if (!token) {
					// We don't have a token, simply return
					return;
				}
				// We have a token, nuke it and archive the affected room
				setRoomToken(null);
				archiveRoom(token)
					.then(deferred.resolve, deferred.reject);
			} else {
				getNewRoomToken().then(function(token) {
					setRoomToken(token);
					decorateAttendees($scope.properties.attendee)
						.then(deferred.resolve, deferred.reject);
				}, function() {
					deferred.reject(t('calendar', 'Failed to create meeting.'))
				});
			}

			return deferred.promise;
		});
	}

}]);
