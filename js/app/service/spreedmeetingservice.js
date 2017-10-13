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

app.service('SpreedMeetingService', ['$rootScope', '$http', '$location', '$q', 'constants', function ($rootScope, $http, $location, $q, constants) {
	'use strict';

	var defaultUrlTemplate = 'call/$meetingId';

	this.meetingUrlTemplate = constants.spreedMeetingUrlTemplate || defaultUrlTemplate;
	this.createMeetingByDefault = constants.createSpreedMeetingByDefault || $location.search().hasOwnProperty('spreedmeeting');

	this.attendeeRoles = {
		GUEST: 'guest',
		MODERATOR: 'moderator',
	};
	this.defaultAttendeeRole = this.attendeeRoles.GUEST;

	// Stolen from Spreed app, spreed/lib/Room.php
	// Type values must be strings, for whatever reason using ints doesn't issue a PUT request
	this.meetingTypes = {
		// ONE_TO_ONE_CALL: '1',
		// GROUP_CALL: '2', // We don't support group calls (a "group" is a Nextcloud" user group)
		PUBLIC_CALL: '3',
	};
	this.defaultMeetingType = this.meetingTypes.PUBLIC_CALL;

	var appBase = 'apps/spreed';

	var getURL = function(path) {
		return document.location.origin + OC.generateUrl(path);
	};

	var getAppURL = function(path) {
		return getURL(appBase + '/' + path);
	};

	this.getRoomURL = function(token) {
		if (!token) {
			return null;
		}
		return getURL(this.meetingUrlTemplate.replace('$meetingId', token));
	};

	this.createRoom = function(type) {
		return $http({
			method: 'POST',
			url: OC.linkToOCS(appBase + '/api/v1', 2) + 'room',
			format: 'json',
			data: {
				roomType: type,
			},
		}).then(function(res) {
			var token = res.data.ocs.data.token;
			return token;
		}, function() {
			// TODO(leon): Maybe pass / annotate error
		});
	};

	this.setRoomName = function(token, name) {
		return $http({
			method: 'PUT',
			url: OC.linkToOCS(appBase + '/api/v1/room', 2) + token,
			format: 'json',
			data: {
				roomName: name,
			},
		}).then(function(res) {
		}, function() {
			// TODO(leon): Maybe pass / annotate error
		});
	};

	this.archiveRoom = function(token) {
		// TODO(leon): Notify backend to archive room
		var deferred = $q.defer();
		deferred.resolve();
		return deferred.promise;
	};

	this.deleteRoom = function(token) {
		return $http({
			method: 'DELETE',
			url: OC.linkToOCS(appBase + '/api/v1/room', 2) + token,
		}).then(function(res) {
		}, function() {
			// TODO(leon): Maybe pass / annotate error
		});
	};

}]);
