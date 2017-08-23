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

app.controller('SpreedMeetingController', ['$scope', '$http', '$q', '$location', 'SpreedMeetingService', function($scope, $http, $q, $location, SpreedMeetingService) {
	'use strict';

	var getCurrentRoomURL = $scope.getCurrentRoomURL = function() {
		return SpreedMeetingService.getRoomURL(getRoomToken());
	};

	var getRoomToken = function() {
		return $scope.properties.spreedmeeting.parameters.token;
	};

	var setRoomToken = function(token) {
		$scope.properties.spreedmeeting.parameters.token = token || ''; // token must be a string
		updateProperties();
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

	$scope.properties.attendeeRoles = [
		{displayname: t('calendar', 'Guest'), val: SpreedMeetingService.attendeeRoles.GUEST},
		{displayname: t('calendar', 'Moderator'), val: SpreedMeetingService.attendeeRoles.MODERATOR},
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

	$scope.properties.meetingTypes = [
		// TODO(leon): Reeable once we support other types of meetings
		// {displayname: t('calendar', 'Private'), val: meetingTypes.ONE_TO_ONE_CALL},
		// TODO(leon): What to do about type 2?
		{displayname: t('calendar', 'Public'), val: SpreedMeetingService.meetingTypes.PUBLIC_CALL},
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
				SpreedMeetingService.archiveRoom(token)
					.then(deferred.resolve, deferred.reject);
			} else {
				var type = $scope.properties.spreedmeeting.parameters.type;
				SpreedMeetingService.getNewRoomToken(type).then(function(token) {
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
