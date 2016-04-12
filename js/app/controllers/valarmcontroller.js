/**
 * ownCloud - Calendar App
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

app.controller('VAlarmController', function($scope) {
	'use strict';

	$scope.newReminderId = -1;

	$scope.alarmFactors = [
		60, //seconds
		60, //minutes
		24, //hours
		7 //days
	];

	$scope.reminderSelect = [
		{ displayname: t('calendar', 'At time of event'), trigger: 0},
		{ displayname: t('calendar', '5 minutes before'), trigger: -1 * 5 * 60},
		{ displayname: t('calendar', '10 minutes before'), trigger: -1 * 10 * 60},
		{ displayname: t('calendar', '15 minutes before'), trigger: -1 * 15 * 60},
		{ displayname: t('calendar', '30 minutes before'), trigger: -1 * 30 * 60},
		{ displayname: t('calendar', '1 hour before'), trigger: -1 * 60 * 60},
		{ displayname: t('calendar', '2 hours before'), trigger: -1 * 2 * 60 * 60},
		{ displayname: t('calendar', 'Custom'), trigger: 'custom'}
	];

	$scope.reminderSelectTriggers = $scope.reminderSelect.map(function(elem) {
		return elem.trigger;
	}).filter(function(elem) {
		return (typeof elem === 'number');
	});

	$scope.reminderTypeSelect = [
		{ displayname: t('calendar', 'Audio'), type: 'AUDIO'},
		{ displayname: t('calendar', 'E Mail'), type: 'EMAIL'},
		{ displayname: t('calendar', 'Pop up'), type: 'DISPLAY'}
	];

	$scope.timeUnitReminderSelect = [
		{ displayname: t('calendar', 'sec'), factor: 1},
		{ displayname: t('calendar', 'min'), factor: 60},
		{ displayname: t('calendar', 'hours'), factor: 60 * 60},
		{ displayname: t('calendar', 'days'), factor: 60 * 60 * 24},
		{ displayname: t('calendar', 'week'), factor: 60 * 60 * 24 * 7}
	];

	$scope.timePositionReminderSelect = [
		{ displayname: t('calendar', 'before'), factor: -1},
		{ displayname: t('calendar', 'after'), factor: 1}
	];

	$scope.startEndReminderSelect = [
		{ displayname: t('calendar', 'start'), type: 'start'},
		{ displayname: t('calendar', 'end'), type: 'end'}
	];

	$scope.$parent.registerPreHook(function() {
		angular.forEach($scope.properties.alarm, function(alarm) {
			$scope._addEditorProps(alarm);
		});
	});

	$scope.$parent.registerPostHook(function() {
		angular.forEach($scope.properties.alarm, function(alarm) {
			if (alarm.editor.triggerType === 'absolute') {
				alarm.trigger.value = alarm.editor.absMoment;
			}
		});
	});

	$scope._addEditorProps = function(alarm) {
		angular.extend(alarm, {
			editor: {
				triggerValue: 0,
				triggerBeforeAfter: -1,
				triggerTimeUnit: 1,
				absMoment: moment(),
				editing: false
			}
		});

		alarm.editor.reminderSelectValue =
			($scope.reminderSelectTriggers.indexOf(alarm.trigger.value) !== -1) ?
				alarm.editor.reminderSelectValue = alarm.trigger.value :
				alarm.editor.reminderSelectValue = 'custom';

		alarm.editor.triggerType =
			(alarm.trigger.type === 'duration') ?
				'relative' :
				'absolute';

		if (alarm.editor.triggerType === 'relative') {
			$scope._prepareRelativeVAlarm(alarm);
		} else {
			$scope._prepareAbsoluteVAlarm(alarm);
		}

		$scope._prepareRepeat(alarm);
	};

	$scope._prepareRelativeVAlarm = function(alarm) {
		var unitAndValue = $scope._getUnitAndValue(Math.abs(alarm.trigger.value));

		angular.extend(alarm.editor, {
			triggerBeforeAfter: (alarm.trigger.value < 0) ? -1 : 1,
			triggerTimeUnit: unitAndValue[0],
			triggerValue: unitAndValue[1]
		});
	};

	$scope._prepareAbsoluteVAlarm = function(alarm) {
		alarm.editor.absMoment = alarm.trigger.value;
	};

	$scope._prepareRepeat = function(alarm) {
		var unitAndValue = $scope._getUnitAndValue((alarm.duration && alarm.duration.value) ? alarm.duration.value : 0);

		angular.extend(alarm.editor, {
			repeat: !(!alarm.repeat.value || alarm.repeat.value === 0),
			repeatNTimes: (alarm.editor.repeat) ? alarm.repeat.value : 0,
			repeatTimeUnit: unitAndValue[0],
			repeatNValue: unitAndValue[1]
		});
	};

	$scope._getUnitAndValue = function(value) {
		var unit = 1;

		for (var i = 0; i < $scope.reminderSelectTriggers.length && value !== 0; i++) {
			var mod = value % $scope.reminderSelectTriggers[i];
			if (mod !== 0) {
				break;
			}

			unit *= $scope.reminderSelectTriggers[i];
			value /= $scope.reminderSelectTriggers[i];
		}

		return [unit, value];
	};

	$scope.add = function() {
		var alarm = {
			id: $scope.newReminderId--,
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			trigger: {
				type: 'duration',
				value: -900,
				related: 'start'
			},
			repeat: {},
			duration: {}
		};

		$scope._addEditorProps(alarm);
		$scope.properties.alarm.push(alarm);
	};

	$scope.remove = function (alarm) {
		$scope.properties.alarm = $scope.properties.alarm.filter(function(elem) {
			return elem.group !== alarm.group;
		});
	};

	$scope.triggerEdit = function(alarm) {
		if (alarm.editor.editing === true) {
			alarm.editor.editing = false;
		} else {
			if ($scope.isEditingReminderSupported(alarm)) {
				alarm.editor.editing = true;
			} else {
				OC.Notification.showTemporary(t('calendar', 'Editing reminders of uknown type not supported.'));
			}
		}
	};

	$scope.isEditingReminderSupported = function(alarm) {
		//WE DON'T AIM TO SUPPORT PROCEDURE
		return (['AUDIO', 'DISPLAY', 'EMAIL'].indexOf(alarm.action.value) !== -1);
	};

	$scope.updateReminderSelectValue = function(alarm) {
		var factor = alarm.editor.reminderSelectValue;
		if (factor !== 'custom') {
			alarm.duration = {};
			alarm.repeat = {};
			alarm.trigger.related = 'start';
			alarm.trigger.type = 'duration';
			alarm.trigger.value = parseInt(factor);

			$scope._addEditorProps(alarm);
		}
	};

	$scope.updateReminderRelative = function(alarm) {
		alarm.trigger.value =
			parseInt(alarm.editor.triggerBeforeAfter) *
			parseInt(alarm.editor.triggerTimeUnit) *
			parseInt(alarm.editor.triggerValue);

		alarm.trigger.type = 'duration';
	};

	$scope.updateReminderAbsolute = function(alarm) {
		if (!moment.isMoment(alarm.trigger.value)) {
			alarm.trigger.value = moment();
		}

		alarm.trigger.type = 'date-time';
	};

	$scope.updateReminderRepeat = function(alarm) {
		alarm.repeat.type = 'string';
		alarm.repeat.value = alarm.editor.repeatNTimes;
		alarm.duration.type = 'duration';
		alarm.duration.value =
			parseInt(alarm.editor.repeatNValue) *
			parseInt(alarm.editor.repeatTimeUnit);
	};
});
