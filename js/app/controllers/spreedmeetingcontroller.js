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

/*

# TODO
- Move directives / factory to an appropriate location
- Reset service, else roomToken is stored and reused across events, why do we even need a service? Without it everything should work fine.

*/

app.directive('spreedMeetingRoomUrl', function() {
	return {
		restrict: 'E',
		templateUrl: 'spreedMeetingRoomUrl.html',
		controller: 'SpreedMeetingController',
	};
});

app.directive('spreedMeetingAttendeeRoles', function() {
	return {
		restrict: 'E',
		templateUrl: 'spreedMeetingAttendeeRoles.html',
		controller: 'SpreedMeetingController',
	};
});

app.controller('SpreedMeetingController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
	'use strict';

	angular.extend($scope.properties, {
		doScheduleMeeting: null, // TODO(leon): Retrieve from somewhere
		roomToken: null, // TODO(leon): Retrieve from somewhere
		oldRoomURL: null,
	});

	// $scope.attendee.parameters.spreedmeetingrole = undefined || 'guest'; // TODO(leon): Retrieve from somewhere
	$scope.attendeeRoles = [
		{displayname: t('calendar', 'Guest'), val: 'guest'},
		{displayname: t('calendar', 'Moderator'), val: 'moderator'},
	];

	// Stolen from Spreed app, spreed/lib/Room.php
	var meetingTypes = {
		ONE_TO_ONE_CALL: 1,
		// GROUP_CALL: 2, // We don't support group calls (a "group" is a Nextcloud" user group)
		PUBLIC_CALL: 3,
	};
	$scope.meetingType = undefined || meetingTypes.PUBLIC_CALL; // TODO(leon): Retrieve from somewhere // TODO(leon): Make this 'private' by default again once we have support for that
	$scope.meetingTypes = [
		// TODO(leon): Reeable once we support other types of meetings
		// {displayname: t('calendar', 'Private'), val: meetingTypes.ONE_TO_ONE_CALL},
		// TODO(leon): What do to about type 2?
		{displayname: t('calendar', 'Public'), val: meetingTypes.PUBLIC_CALL},
	];

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
		// return $scope.meetingType + ": " + getAppURL('call/' + token);
		return $scope.meetingType + ": " + getURL('call/' + token);
	};

	var getCurrentRoomURL = $scope.getCurrentRoomURL = function() {
		return getRoomURL($scope.properties.roomToken);
	};

	var getOldRoomURL = function() {
		return $scope.properties.oldRoomURL;
	};

	var getNewRoomToken = function() {
		return $http({
			method: 'POST',
			url: OC.linkToOCS(spreedAppBase + '/api/v1', 2) + 'room',
			format: 'json',
			data: {
				roomType: $scope.meetingType,
			},
		}).then(function(res) {
			return res.data.ocs.data.token;
		}, function() {
			// TODO(leon): Handle error
		});
	};

	// TODO(leon): Fix this mess, why do we even need multiple room URLs? Stupid idea ;)
	var setRoomToken = function(token) {
		$scope.properties.roomToken = token;

		var delimiter = "\n";
		$scope.properties.description = $scope.properties.description || {value: ''};
		if (!$scope.properties.description.value) {
			// We don't have any description, so we also don't need a delimiter
			delimiter = "";
		}

		// Remove old room URL from description
		if ($scope.properties.oldRoomURL) {
			$scope.properties.description.value = $scope.properties.description.value.replace(delimiter + $scope.properties.oldRoomURL, "");
		}

		var currentRoomURL = getCurrentRoomURL();
		// Bail out if we no longer have a room token -> meeting disabled
		if (!currentRoomURL) {
			return;
		}
		$scope.properties.description.value += delimiter + currentRoomURL;

		// Back up "old" room URL
		$scope.properties.oldRoomURL = currentRoomURL;

		// Fix roomurl textarea size
		// TODO(leon): This is crap and should not be done by us but automatically
		$timeout(function() {
			autosize.update($('.advanced--textarea[name="roomurl"]'));
		}, 50);
	}

	var resetRoomToken = function() {
		setRoomToken(null);
	};

	var updateRoomToken = function() {
		if ($scope.properties.roomToken) {
			resetRoomToken();
			return;
		}
		getNewRoomToken().then(setRoomToken);
	};

	$scope.scheduleMeetingChanged = function() {
		updateRoomToken();
	};

	$scope.meetingTypeChanged = function() {
		updateRoomToken();
	};

	$scope.$parent.registerPostHook(function() {
		var currentRoomURL = getCurrentRoomURL();
		if (!currentRoomURL) {
			return;
		}
		$scope.properties.url = {
			value: currentRoomURL,
		};
	});

}]);
