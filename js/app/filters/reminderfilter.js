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
	
	return function(alarm) {
		if (typeof alarm !== 'object' || !alarm || typeof alarm.trigger !== 'object' || !alarm.trigger) {
			return '';
		}

		var relative = alarm.trigger.type === 'duration';
		var relatedToStart = alarm.trigger.related === 'start';
		if (relative) {
			var timeString = moment.duration(Math.abs(alarm.trigger.value), 'seconds').humanize();
			if (alarm.trigger.value < 0) {
				if (relatedToStart) {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm {time} before the event starts', {time: timeString});

						case 'DISPLAY':
							return t('calendar', 'Pop-up {time} before the event starts', {time: timeString});

						case 'EMAIL':
							return t('calendar', 'Email {time} before the event starts', {time: timeString});

						case 'NONE':
							return t('calendar', 'None {time} before the event starts', {time: timeString});

						default:
							return t('calendar', '{type} {time} before the event starts', {type: alarm.action.value, time: timeString});
					}
				} else {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm {time} before the event ends', {time: timeString});

						case 'DISPLAY':
							return t('calendar', 'Pop-up {time} before the event ends', {time: timeString});

						case 'EMAIL':
							return t('calendar', 'Email {time} before the event ends', {time: timeString});

						case 'NONE':
							return t('calendar', 'None {time} before the event ends', {time: timeString});

						default:
							return t('calendar', '{type} {time} before the event ends', {type: alarm.action.value, time: timeString});
					}
				}
			} else if (alarm.trigger.value > 0) {
				if (relatedToStart) {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm {time} after the event starts', {time: timeString});

						case 'DISPLAY':
							return t('calendar', 'Pop-up {time} after the event starts', {time: timeString});

						case 'EMAIL':
							return t('calendar', 'Email {time} after the event starts', {time: timeString});

						case 'NONE':
							return t('calendar', 'None {time} after the event starts', {time: timeString});

						default:
							return t('calendar', '{type} {time} after the event starts', {type: alarm.action.value, time: timeString});
					}
				} else {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm {time} after the event ends', {time: timeString});

						case 'DISPLAY':
							return t('calendar', 'Pop-up {time} after the event ends', {time: timeString});

						case 'EMAIL':
							return t('calendar', 'Email {time} after the event ends', {time: timeString});

						case 'NONE':
							return t('calendar', 'None {time} after the event ends', {time: timeString});

						default:
							return t('calendar', '{type} {time} after the event ends', {type: alarm.action.value, time: timeString});
					}
				}
			} else {
				if (relatedToStart) {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm at the event\'s start');

						case 'DISPLAY':
							return t('calendar', 'Pop-up at the event\'s start');

						case 'EMAIL':
							return t('calendar', 'Email at the event\'s start');

						case 'NONE':
							return t('calendar', 'None at the event\'s start');

						default:
							return t('calendar', '{type} at the event\'s start', {type: alarm.action.value});
					}
				} else {
					switch(alarm.action.value) {
						case 'AUDIO':
							return t('calendar', 'Audio alarm at the event\'s end');

						case 'DISPLAY':
							return t('calendar', 'Pop-up at the event\'s end');

						case 'EMAIL':
							return t('calendar', 'Email at the event\'s end');

						case 'NONE':
							return t('calendar', 'None at the event\'s end');

						default:
							return t('calendar', '{type} at the event\'s end', {type: alarm.action.value});
					}
				}
			}
		} else {
			if (alarm.editor && moment.isMoment(alarm.editor.absMoment)) {
				switch(alarm.action.value) {
					case 'AUDIO':
						return t('calendar', 'Audio alarm at {time}', {time: alarm.editor.absMoment.format('LLLL')});

					case 'DISPLAY':
						return t('calendar', 'Pop-up at {time}', {time: alarm.editor.absMoment.format('LLLL')});

					case 'EMAIL':
						return t('calendar', 'Email at {time}', {time: alarm.editor.absMoment.format('LLLL')});

					case 'NONE':
						return t('calendar', 'None at {time}', {time: alarm.editor.absMoment.format('LLLL')});

					default:
						return t('calendar', '{type} at {time}', {
							type: alarm.action.value,
							time: alarm.editor.absMoment.format('LLLL')
						});
				}
			} else {
				return '';
			}
		}
	};
});
