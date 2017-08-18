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
	var meetingTypes = {
		// ONE_TO_ONE_CALL: '1',
		// GROUP_CALL: '2', // We don't support group calls (a "group" is a Nextcloud" user group)
		PUBLIC_CALL: '3',
	};
	var defaultMeetingType = meetingTypes.PUBLIC_CALL; // TODO(leon): Make this 'private' by default again once we have support for that
	$scope.properties.meetingTypes = [
		// TODO(leon): Reeable once we support other types of meetings
		// {displayname: t('calendar', 'Private'), val: meetingTypes.ONE_TO_ONE_CALL},
		// TODO(leon): What do to about type 2?
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
		// We are set to schedule a meeting if we have a token
		doScheduleMeeting: !!$scope.properties.spreedmeeting.parameters.token,
	});

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
		return $scope.properties.spreedmeeting.parameters.type + ": " + getURL('call/' + token);
	};

	var getCurrentRoomURL = $scope.getCurrentRoomURL = function() {
		return getRoomURL($scope.properties.spreedmeeting.parameters.token);
	};

	var getNewRoomToken = function() {
		return $http({
			method: 'POST',
			url: OC.linkToOCS(spreedAppBase + '/api/v1', 2) + 'room',
			format: 'json',
			data: {
				roomType: $scope.properties.spreedmeeting.parameters.type,
			},
		}).then(function(res) {
			var token = res.data.ocs.data.token;
			return token;
		}, function() {
			// TODO(leon): Maybe pass / annotate error
		});
	};

	$scope.$parent.registerPostHook(function() {
		if (!$scope.properties.doScheduleMeeting) {
			// We don't want to create a meeting
			return;
		}

		var deferred = $q.defer();
		getNewRoomToken().then(function(token) {
			$scope.properties.spreedmeeting.parameters.token = token;
			$scope.properties.url = {
				value: getCurrentRoomURL(),
			};
			deferred.resolve();
		}, function() {
			deferred.reject(t('calendar', 'Failed to create meeting.'))
		});
		return deferred.promise;
	});

}]);
