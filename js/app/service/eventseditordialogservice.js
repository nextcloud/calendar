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

app.service('EventsEditorDialogService', function($uibModal, constants, settings) {
	'use strict';

	const EDITOR_POPOVER = 'eventspopovereditor.html';
	const EDITOR_SIDEBAR = 'eventssidebareditor.html';
	const REPEAT_QUESTION = 'eventsrecurrenceexceptionquestion.html';

	const EDIT_ALL = 'all';
	const EDIT_THISONLY = 'thisOnly';
	const EDIT_THISANDFUTURE = 'thisAndFuture';

	const context = {
		fcEvent: null,
		promise: null,
		eventModal: null
	};

	/**
	 * cleanup context variables after dialog was closed
	 */
	context.cleanup = () => {
		context.fcEvent = null;
		context.promise = null;
		context.eventModal = null;
	};

	/**
	 * checks if popover should be shown based
	 * on viewport dimensions
	 * @returns {boolean}
	 */
	context.showPopover = () => {
		return angular.element(window).width() > 768;
	};

	/**
	 * set position of popover based on previously calculated position
	 * @param {object[]} position
	 */
	context.positionPopover = (position) => {
		angular.element('#popover-container').css('display', 'none');
		angular.forEach(position, (v) => {
			angular.element('.modal').css(v.name, v.value);
		});
		angular.element('#popover-container').css('display', 'block');
	};

	/**
	 * open dialog for editing events
	 * @param {string} template - use EDITOR_POPOVER or EDITOR_SIDEBAR
	 * @param {resolveCallback} resolve
	 * @param {rejectCallback} reject
	 * @param {unlockCallback} unlock
	 * @param {object[]} position
	 * @param {object} scope
	 * @param {FcEvent} fcEvent
	 * @param {SimpleEvent} simpleEvent
	 * @param {Calendar} calendar
	 * @param {string} editType
	 */
	context.openDialog = (template, resolve, reject, unlock, position, scope, fcEvent, simpleEvent, calendar, editType) => {
		context.fcEvent = fcEvent;
		console.log(fcEvent.vevent);
		context.eventModal = $uibModal.open({
			appendTo: (template === EDITOR_POPOVER) ?
				angular.element('#popover-container') :
				angular.element('#app-content'),
			controller: 'EditorController',
			resolve: {
				vevent: () => fcEvent.vevent,
				simpleEvent: () => simpleEvent,
				calendar: () => calendar,
				isNew: () => (fcEvent.vevent.etag === null || fcEvent.vevent.etag === ''),
				emailAddress: () => constants.emailAddress
			},
			scope: scope,
			templateUrl: template,
			windowClass: (template === EDITOR_POPOVER) ? 'popover' : null
		});

		if (template === EDITOR_SIDEBAR) {
			angular.element('#app-content').addClass('with-app-sidebar');
		}

		context.eventModal.rendered.then(() => context.positionPopover(position));
		context.eventModal.result.then((result) => {
			console.log(result);

			if (result.action === 'proceed') {
				context.openDialog(EDITOR_SIDEBAR, resolve, reject, unlock, [], scope, fcEvent, simpleEvent, result.calendar, editType);
			} else {
				if (template === EDITOR_SIDEBAR) {
					angular.element('#app-content').removeClass('with-app-sidebar');
				}

				unlock();
				context.cleanup();

				if (editType === EDIT_THISANDFUTURE) {
					const previousVEvent = fcEvent.getPreviousVEvent();
					resolve({
						create: [{
							calendar: result.calendar,
							vevent: result.vevent
						}],
						update: [{
							calendar: previousVEvent.calendar,
							vevent: previousVEvent
						}]
					});
					return;
				}

				if (fcEvent.vevent.etag === null || fcEvent.vevent.etag === '') {
					resolve({
						create: [{
							calendar: result.calendar,
							vevent: result.vevent
						}]
					});
				} else {
					// resolve for new event and old event!
					resolve({
						update: [{
							calendar: result.calendar,
							vevent: result.vevent
						}]
					});
				}
			}
		}).catch((reason) => {
			if (template === EDITOR_SIDEBAR) {
				angular.element('#app-content').removeClass('with-app-sidebar');
			}

			if (reason === 'delete') {
				if (editType === EDIT_THISANDFUTURE) {
					fcEvent.revertCreateForkKeepingRRule();

					unlock();
					resolve({
						update: [{
							calendar: fcEvent.vevent.calendar,
							vevent: fcEvent.vevent
						}]
					});
					return;
				} else {
					const count = fcEvent.removeFromVEvent();
					if (count === 0) {
						unlock();
						reject(reason);
						return;
					} else {
						unlock();
						resolve({
							update:[{
								calendar: fcEvent.vevent.calendar,
								vevent: fcEvent.vevent
							}]
						});
						return;
					}
				}
			}

			if (reason === 'escape key press' || reason === 'cancel' || reason === 'superseded') {
				if (editType === EDIT_THISONLY) {
					fcEvent.revertCreateRecurrenceException();
				}
				if (editType === EDIT_THISANDFUTURE) {
					fcEvent.revertCreateFork();
				}
			}

			if (reason !== 'superseded') {
				context.cleanup();
			}

			unlock();
			reject(reason);
		});
	};

	context.openRepeatQuestion = (resolve, reject, unlock, position, scope, fcEvent, simpleEvent, calendar) => {
		context.eventModal = $uibModal.open({
			appendTo: angular.element('#popover-container'),
			controller: 'EditorRecurrenceQuestionController',
			templateUrl: REPEAT_QUESTION,
			windowClass: 'popover'
		});

		context.eventModal.rendered.then(() => context.positionPopover(position));
		context.eventModal.result.then((result) => {
			let editType = EDIT_ALL;
			if (result.action === 'thisOnly') {
				fcEvent.createRecurrenceException();
				simpleEvent = fcEvent.getSimpleEvent();
				editType = EDIT_THISONLY;
			} else if (result.action === 'thisAndAllFuture') {
				if (fcEvent.recurrenceDetails.firstOccurrence) {
					editType = EDIT_ALL;
				} else {
					// fullcalendar copies the event
					// we are using a getter, so fc thinks its a static value
					// hence fcEvent.vevent won't be updated in the copy
					// so we need to get the original fcEvent object
					fcEvent = fcEvent.createFork();
					simpleEvent = fcEvent.getSimpleEvent();

					// set etag to some value so we open the edit event dialog, not the create one
					// TODO - this will also show an export button that leads to a 404
					// TODO - find a better approach for this
					fcEvent.vevent.etag = EDIT_THISANDFUTURE;

					editType = EDIT_THISANDFUTURE;
				}
			}

			// skip popover on small devices
			if (context.showPopover() && !settings.skipPopover) {
				context.openDialog(EDITOR_POPOVER, resolve, reject, unlock, position, scope, fcEvent, simpleEvent, calendar, editType);
			} else {
				context.openDialog(EDITOR_SIDEBAR, resolve, reject, unlock, [], scope, fcEvent, simpleEvent, calendar, editType);
			}
		}).catch((reason) => {
			// only way to trigger this is to hit escape or click outside the dialog,
			// just cancel editing in that case
			unlock();
			reject(reason);
		});
	};

	/**
	 * open dialog for editing events
	 * @param {object} scope
	 * @param {FcEvent} fcEvent
	 * @param {positionCallback} calculatePosition
	 * @param {lockCallback} lock
	 * @param {unlockCallback} unlock
	 * @returns {Promise}
	 */
	this.open = function(scope, fcEvent, calculatePosition, lock, unlock) {
		// don't reload editor for the same event
		if (context.fcEvent === fcEvent) {
			return context.promise;
		}

		// dismiss existing dialogs
		if (context.fcEvent) {
			context.eventModal.dismiss('superseded');
		}

		context.promise = new Promise(function(resolve, reject) {
			// calculate position of popover
			// needs to happen before locking event
			const position = calculatePosition();

			// lock new fcEvent
			lock();

			const calendar = (fcEvent.vevent) ? fcEvent.vevent.calendar : null;
			const simpleEvent = fcEvent.getSimpleEvent();

			if (fcEvent.recurrenceDetails.recurring) {
				context.openRepeatQuestion(resolve, reject, unlock, position, scope, fcEvent, simpleEvent, calendar);
				return;
			}

			// skip popover on small devices
			if (context.showPopover() && !settings.skipPopover) {
				context.openDialog(EDITOR_POPOVER, resolve, reject, unlock, position, scope, fcEvent, simpleEvent, calendar, EDIT_ALL);
			} else {
				context.openDialog(EDITOR_SIDEBAR, resolve, reject, unlock, [], scope, fcEvent, simpleEvent, calendar, EDIT_ALL);
			}
		});

		return context.promise;
	};

	/**
	 * @callback resolveCallback
	 * @param {*} value
	 */
	/**
	 * @callback rejectCallback
	 * @param {*} reason
	 */
	/**
	 * @callback positionCallback
	 */
	/**
	 * @callback lockCallback
	 */
	/**
	 * @callback unlockCallback
	 */
});
