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

app.factory('FcEvent', function(SimpleEvent) {
	'use strict';

	/**
	 * @param {VEvent} vevent
	 * @param {ICAL.Component} event
	 * @param {ICAL.Time} start
	 * @param {ICAL.Time} end
	 * @param {object} recurrenceDetails
	 */
	function FcEvent(vevent, event, start, end, recurrenceDetails) {
		const context = {vevent, event};
		context.iCalEvent = new ICAL.Event(event);

		context.previousEvent = null;
		context.peviousVEvent = null;
		context.previousRRule = null;

		let id = context.vevent.uri;
		if (event.hasProperty('recurrence-id')) {
			id += context.event.getFirstPropertyValue('recurrence-id').toICALString();
		}

		const allDay = (start.icaltype === 'date' && end.icaltype === 'date');
		context.allDay = allDay;

		const iface = {
			_isAFcEventObject: true,
			id: id,
			allDay: allDay,
			start: moment(start.toString()),
			end: moment(end.toString()),
			repeating: context.iCalEvent.isRecurring(),
			className: ['fcCalendar-id-' + vevent.calendar.tmpId],
			editable: vevent.calendar.isWritable(),
			backgroundColor: vevent.calendar.color,
			borderColor: vevent.calendar.color,
			textColor: vevent.calendar.textColor,
			title: event.getFirstPropertyValue('summary'),
			recurrenceDetails: recurrenceDetails
		};

		Object.defineProperties(iface, {
			vevent: {
				get: function() {
					return context.vevent;
				},
				enumerable: true
			},
			event: {
				get: function() {
					return context.event;
				},
				enumerable: true
			},
			calendar: {
				get: () => context.vevent.calendar,
				enumerable: true
			}
		});

		/**
		 * get SimpleEvent for current fcEvent
		 * @returns {SimpleEvent}
		 */
		iface.getSimpleEvent = function () {
			return SimpleEvent(context.event);
		};

		/**
		 * moves the event to a different position
		 * @param {moment.duration} delta
		 * @param {boolean} isAllDay
		 * @param {string} timezone
		 * @param {moment.duration} defaultTimedEventMomentDuration
		 * @param {moment.duration} defaultAllDayEventMomentDuration
		 */
		iface.drop = function (delta, isAllDay, timezone, defaultTimedEventMomentDuration, defaultAllDayEventMomentDuration) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			const timedDuration = new ICAL.Duration().fromSeconds(defaultTimedEventMomentDuration.asSeconds());
			const allDayDuration = new ICAL.Duration().fromSeconds(defaultAllDayEventMomentDuration.asSeconds());

			const dtstartProp = context.event.getFirstProperty('dtstart');
			const dtstart = dtstartProp.getFirstValue();
			dtstart.isDate = isAllDay;
			dtstart.addDuration(delta);
			dtstart.zone = isAllDay ? 'floating' : dtstart.zone;

			// event was moved from allDay to grid
			// we need to add a tzid to the dtstart
			if (context.allDay && !isAllDay) {
				const timezoneObject = ICAL.TimezoneService.get(timezone);

				if (timezone === 'UTC') {
					timezone = 'Z';
				}

				dtstart.zone = timezoneObject;
				if (timezone !== 'Z') {
					dtstartProp.setParameter('tzid', timezone);

					if (context.event.parent) {
						context.event.parent.addSubcomponent(timezoneObject.component);
					}
				}
			}
			// event was moved from grid to allDay
			// remove tzid
			if (!context.allDay && isAllDay) {
				dtstartProp.removeParameter('tzid');
			}
			context.event.updatePropertyWithValue('dtstart', dtstart);

			// event was moved from allday to grid or vice versa
			if (context.allDay !== isAllDay) {
				// No DURATION -> either DTEND or only DTSTART
				if (!context.event.hasProperty('duration')) {
					const dtend = dtstart.clone();
					dtend.addDuration(isAllDay ? allDayDuration : timedDuration);
					const dtendProp = context.event.updatePropertyWithValue('dtend', dtend);

					const tzid = dtstartProp.getParameter('tzid');
					if (tzid) {
						dtendProp.setParameter('tzid', tzid);
					} else {
						dtendProp.removeParameter('tzid');
					}
				} else {
					context.event.updatePropertyWithValue('duration', isAllDay ?
						allDayDuration : timedDuration);
				}
			} else {
				// No DURATION -> either DTEND or only DTSTART
				if (context.event.hasProperty('dtend')) {
					const dtend = context.event.getFirstPropertyValue('dtend');
					dtend.addDuration(delta);
					context.event.updatePropertyWithValue('dtend', dtend);
				}
			}

			context.allDay = isAllDay;
			context.vevent.touch();
		};

		/**
		 * resizes the event
		 * @param {moment.duration} delta
		 */
		iface.resize = function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (context.event.hasProperty('duration')) {
				const duration = context.event.getFirstPropertyValue('duration');
				duration.fromSeconds((delta.toSeconds() + duration.toSeconds()));
				context.event.updatePropertyWithValue('duration', duration);
			} else if (context.event.hasProperty('dtend')) {
				const dtend = context.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				context.event.updatePropertyWithValue('dtend', dtend);
			} else if (context.event.hasProperty('dtstart')) {
				const dtstart = event.getFirstProperty('dtstart');
				const dtend = dtstart.getFirstValue().clone();
				dtend.addDuration(delta);

				const prop = context.event.addPropertyWithValue('dtend', dtend);

				const tzid = dtstart.getParameter('tzid');
				if (tzid) {
					prop.setParameter('tzid', tzid);
				}
			}

			context.vevent.touch();
		};

		/**
		 *
		 */
		iface.createRecurrenceException = function() {
			context.previousEvent = context.event;
			const ics = context.event.toString();
			const newComp = new ICAL.Component(ICAL.parse(ics));

			newComp.addPropertyWithValue('recurrence-id',
				iface.recurrenceDetails.recurrenceId);

			if (newComp.hasProperty('dtend')) {
				const diff = newComp.getFirstPropertyValue('dtend').subtractDateTz(
					newComp.getFirstPropertyValue('dtstart'));
				const dtend = iface.recurrenceDetails.recurrenceId.clone();
				dtend.addDuration(diff);

				newComp.updatePropertyWithValue('dtend', dtend);
			}

			newComp.updatePropertyWithValue('dtstart',
				iface.recurrenceDetails.recurrenceId.clone());

			newComp.removeAllProperties('rrule');
			newComp.removeAllProperties('exrule');
			newComp.removeAllProperties('rdate');
			newComp.removeAllProperties('exdate');

			context.vevent.comp.addSubcomponent(newComp);
			context.event = newComp;

			return newComp;
		};

		/**
		 * revert changes previously made by
		 * createRecurrenceException
		 */
		iface.revertCreateRecurrenceException = function() {
			if (context.previousEvent) {
				context.vevent.comp.removeSubcomponent(context.event);
				context.event = context.previousEvent;
			}
		};

		/**
		 * create a fork for modifying this and all future events
		 */
		iface.createFork = function() {
			const oldRRule = context.event.getFirstPropertyValue('rrule');
			if (!oldRRule) {
				return;
			}

			context.previousEvent = context.event;
			context.previousVEvent = context.vevent;
			context.previousRRule = oldRRule.clone();

			const ics = context.event.toString();
			const newComp = new ICAL.Component(ICAL.parse(ics));
			const fork = context.vevent.fork(newComp);

			const newRRule = newComp.getFirstPropertyValue('rrule');
			if (oldRRule.count) {
				newRRule.count = oldRRule.count - iface.recurrenceDetails.count + 1;
				oldRRule.count = iface.recurrenceDetails.count - 1;
			} else {
				oldRRule.until = iface.recurrenceDetails.recurrenceId.clone();
				console.log(oldRRule.until.toString());
				oldRRule.until.addDuration(ICAL.Duration.fromSeconds(-1 * 60 * 60 * 24));
				console.log(oldRRule.until.toString());
			}

			context.previousEvent.updatePropertyWithValue('rrule', oldRRule);
			newComp.updatePropertyWithValue('rrule', newRRule);

			if (newComp.hasProperty('dtend')) {
				const diff = newComp.getFirstPropertyValue('dtend').subtractDateTz(
					newComp.getFirstPropertyValue('dtstart'));
				const dtend = iface.recurrenceDetails.recurrenceId.clone();
				dtend.addDuration(diff);

				newComp.updatePropertyWithValue('dtend', dtend);
			}

			newComp.updatePropertyWithValue('dtstart',
				iface.recurrenceDetails.recurrenceId.clone());

			context.vevent = fork;
			context.event = newComp;

			console.log('successfully forked event');
			console.log('fork:', fork, context.vevent, iface.vevent);
			console.log('event:', newComp, context.event, iface.event);

			return iface;
		};

		/**
		 * revert changes previously made by
		 * createFork
		 */
		iface.revertCreateFork = function() {
			if (context.previousRRule) {
				context.vevent = context.previousVEvent;
				context.event = context.previousEvent;
				context.event.updatePropertyWithValue('rrule', context.previousRRule);
			}

			context.previousEvent = null;
			context.previousVEvent = null;
			context.previousRRule = null;
		};

		iface.isForked = function() {
			return context.previousRRule;
		};

		iface.revertCreateForkKeepingRRule = function() {
			if (context.previousRRule) {
				context.vevent = context.previousVEvent;
				context.event = context.previousEvent;
			}

			context.previousEvent = null;
			context.previousVEvent = null;
			context.previousRRule = null;
		};

		iface.getPreviousVEvent = () => {
			return context.previousVEvent;
		};

		/**
		 * Does this event have multiple recurrence rule sets?
		 * @return {boolean}
		 */
		iface.hasMultipleRRules = function() {
			// getAllProperties always returns an array, so its safe to use length directly
			return context.event.getAllProperties('rrule').length > 1;
		};

		/**
		 * removes VEvent that this fcEvent is based on from
		 * VEvent object and returns number of vEvents left
		 * @return {number}
		 */
		iface.removeFromVEvent = function() {
			if (context.event.hasProperty('recurrence-id')) {
				const recurrenceId = context.event.getFirstPropertyValue('recurrence-id');
				const rootElement = context.vevent.findComponentByRecurrenceId(null);

				if (rootElement) {
					rootElement.addPropertyWithValue('exdate', recurrenceId.clone());
				}
			}

			context.vevent.comp.removeSubcomponent(context.event);

			return context.vevent.comp.getAllSubcomponents('vevent').length;
		};

		/**
		 * lock fc event for editing
		 */
		iface.lock = function() {
			context.lock = true;
		};

		/**
		 * unlock fc event
		 */
		iface.unlock = function() {
			context.lock = false;
		};

		return iface;
	}

	FcEvent.isFcEvent = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isAFcEventObject === true);
	};

	return FcEvent;
});
