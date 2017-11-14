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

app.filter('simpleReminderDescription', function() {
	'use strict';
	
	var actionMapper = {
		AUDIO: t('calendar', 'Audio alarm'),
		DISPLAY: t('calendar', 'Pop-up'),
		EMAIL: t('calendar', 'Email'),
		NONE: t('calendar', 'None')
	};

	function getActionName(alarm) {
		var name = alarm.action.value;
		if (name && actionMapper.hasOwnProperty(name)) {
			return actionMapper[name];
		} else {
			return name;
		}
	}

	return function(alarm) {
		if (typeof alarm !== 'object' || !alarm || typeof alarm.trigger !== 'object' || !alarm.trigger) {
			return '';
		}

		var relative = alarm.trigger.type === 'duration';
		var relatedToStart = alarm.trigger.related === 'start';
		var translationEscapingDisabled = { escape: false };
		var translationVars = { type: getActionName(alarm) };
		if (relative) {
			var timeString = moment.duration(Math.abs(alarm.trigger.value), 'seconds').humanize();
			if (alarm.trigger.value < 0) {
				var translationKey = '{type} {time} before the event ' + ( relatedToStart ? 'starts' : 'ends' );
				translationVars.time = timeString;
			} else if (alarm.trigger.value > 0) {
				var translationKey = '{type} {time} after the event ' + ( relatedToStart ? 'starts' : 'ends' );
				translationVars.time = timeString;
			} else {
				var translationKey = '{type} at the event\'s ' + ( relatedToStart ? 'start' : 'end' );
			}
		} else {
			if (alarm.editor && moment.isMoment(alarm.editor.absMoment)) {
				var translationKey = '{type} at {time}';
				translationVars.time = alarm.editor.absMoment.format('LLLL');
			} else {
				return '';
			}
		}
		return t('calendar', translationKey, translationVars, undefined, translationEscapingDisabled);
	};
});
