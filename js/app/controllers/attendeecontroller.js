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

app.controller('AttendeeController', function($scope, AutoCompletionService) {
	'use strict';

	$scope.newAttendeeGroup = -1;
	$scope.nameofattendee = '';

	$scope.cutstats = [
		{displayname: t('calendar', 'Individual'), val: 'INDIVIDUAL'},
		{displayname: t('calendar', 'Group'), val: 'GROUP'},
		{displayname: t('calendar', 'Resource'), val: 'RESOURCE'},
		{displayname: t('calendar', 'Room'), val: 'ROOM'},
		{displayname: t('calendar', 'Unknown'), val: 'UNKNOWN'}
	];

	$scope.partstats = [
		{displayname: t('calendar', 'Required'), val: 'REQ-PARTICIPANT'},
		{displayname: t('calendar', 'Optional'), val: 'OPT-PARTICIPANT'},
		{displayname: t('calendar', 'Does not attend'), val: 'NON-PARTICIPANT'}
	];

	$scope.$parent.properties.attendee = $scope.$parent.properties.attendee || [];

	$scope.$parent.registerPostHook(function() {
		$scope.$parent.properties.attendee = $scope.$parent.properties.attendee || [];
		if ($scope.$parent.properties.attendee.length > 0 && $scope.$parent.properties.organizer === null) {
			$scope.$parent.properties.organizer = {
				value: 'MAILTO:' + $scope.$parent.emailAddress,
				parameters: {
					cn: OC.getCurrentUser().displayName
				}
			};
		}
	});

	$scope.add = function (email) {
		if (email !== '') {
			if (!$scope.validateEMail(email)) {
				OC.Notification.showTemporary('Please enter a valid e-mail address!');
				return;
			}

			if ($scope.isEMailInAttendeeList(email)) {
				OC.Notification.showTemporary('This person is already in your attendee list.');
				return;
			}

			$scope.$parent.properties.attendee = $scope.$parent.properties.attendee || [];
			$scope.$parent.properties.attendee.push({
				value: $scope.mailtoHelper(email),
				group: $scope.newAttendeeGroup--,
				parameters: {
					'role': 'REQ-PARTICIPANT',
					'rsvp': 'TRUE',
					'partstat': 'NEEDS-ACTION',
					'cutype': 'INDIVIDUAL'
				}
			});
		}
		$scope.attendeeoptions = false;
		$scope.nameofattendee = '';

		console.log($scope.$parent.properties.attendee);
	};

	$scope.$on('save-contents', function() {
		$scope.add($scope.nameofattendee);
	});

	$scope.remove = function (attendee) {
		$scope.$parent.properties.attendee = $scope.$parent.properties.attendee.filter(function(elem) {
			return elem.group !== attendee.group;
		});
	};

	$scope.search = function (value) {
		return AutoCompletionService.searchAttendee(value).then((attendees) => {
			const arr = [];

			attendees.forEach((attendee) => {
				const emailCount = attendee.email.length;
				attendee.email.forEach((email) => {
					let displayname;
					if (emailCount === 1) {
						displayname = attendee.name;
					} else {
						displayname = t('calendar', '{name} ({email})', {
							name: attendee.name,
							email: email
						});
					}

					arr.push({
						displayname: displayname,
						email: email,
						name: attendee.name
					});
				});
			});

			return arr.filter((elm) => !$scope.isEMailInAttendeeList(elm.email));
		});
	};

	$scope.selectFromTypeahead = function (item) {
		if ($scope.isEMailInAttendeeList(item.email)) {
			OC.Notification.showTemporary('This person is already in your attendee list.');
			return;
		}

		$scope.$parent.properties.attendee.push({
			value: $scope.mailtoHelper(item.email),
			group: $scope.newAttendeeGroup--,
			parameters: {
				cn: item.name,
				role: 'REQ-PARTICIPANT',
				rsvp: 'TRUE',
				partstat: 'NEEDS-ACTION',
				cutype: 'INDIVIDUAL'
			}
		});
		$scope.nameofattendee = '';
	};

	$scope.didUserSetupEmail = () => ($scope.$parent.emailAddress !== '');
	$scope.isAttendeeListEmpty = () => ($scope.$parent.properties.attendee.length === 0);

	$scope.isEMailInAttendeeList = (emailAddress) => {
		console.log($scope.$parent.properties.attendee, $scope.mailtoHelper(emailAddress));

		return !!$scope.$parent.properties.attendee.filter(
			(elm) => elm.value === $scope.mailtoHelper(emailAddress)).length;
	};

	$scope.mailtoHelper = (emailAddress) => {
		return 'MAILTO:' + emailAddress;
	};

	$scope.validateEMail = (emailAddress) => {
		const helperInput = document.createElement('input');
		helperInput.type = 'email';
		helperInput.value = emailAddress;

		return typeof helperInput.checkValidity === 'function' ?
			helperInput.checkValidity() :
			/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(emailAddress);
	};
});
