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
	const REPEAT_QUESTION = ''; // TODO in followup PR

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
	 * open dialog for editing events
	 * @param {string} template - use EDITOR_POPOVER or EDITOR_SIDEBAR
	 * @param {resolveCallback} resolve
	 * @param {rejectCallback} reject
	 * @param {unlockCallback} unlock
	 * @param {string} attachTo
	 * @param {object} scope
	 * @param {FcEvent} fcEvent
	 * @param {SimpleEvent} simpleEvent
	 * @param {Calendar} calendar
	 */
	context.openDialog = (template, resolve, reject, unlock, attachTo, scope, fcEvent, simpleEvent, calendar) => {
		context.fcEvent = fcEvent;
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

		if (template === EDITOR_POPOVER) {
			context.eventModal.rendered.then(() => {
				new Tether({
					element: '.modal.popover',
					target: attachTo,
					attachment: 'bottom center',
					targetAttachment: 'top center',
					constraints: [
						{
							to: 'scrollParent',
							attachment: 'together',
							pin: true,
						}
					]
				});
			});
		}
		context.eventModal.result.then((result) => {
			if (result.action === 'proceed') {
				context.openDialog(EDITOR_SIDEBAR, resolve, reject, unlock, [], scope, fcEvent, simpleEvent, result.calendar);
			} else {
				if (template === EDITOR_SIDEBAR) {
					angular.element('#app-content').removeClass('with-app-sidebar');
				}

				unlock();
				context.cleanup();
				resolve({
					calendar: result.calendar,
					vevent: result.vevent
				});
			}
		}).catch((reason) => {
			if (template === EDITOR_SIDEBAR) {
				angular.element('#app-content').removeClass('with-app-sidebar');
			}

			if (reason !== 'superseded') {
				context.cleanup();
			}

			unlock();
			reject(reason);
		});
	};

	context.openRepeatQuestion = () => {
		// TODO in followup PR
	};

	/**
	 * open dialog for editing events
	 * @param {object} scope
	 * @param {FcEvent} fcEvent
	 * @param {string} attachTo
	 * @param {lockCallback} lock
	 * @param {unlockCallback} unlock
	 * @returns {Promise}
	 */
	this.open = function(scope, fcEvent, attachTo, lock, unlock) {
		// don't reload editor for the same event
		if (context.fcEvent === fcEvent) {
			return context.promise;
		}

		// dismiss existing dialogs
		if (context.fcEvent) {
			context.eventModal.dismiss('superseded');
		}

		context.promise = new Promise(function(resolve, reject) {
			// lock new fcEvent
			lock();

			const calendar = (fcEvent.vevent) ? fcEvent.vevent.calendar : null;
			const simpleEvent = fcEvent.getSimpleEvent();

			// skip popover on small devices
			if (context.showPopover() && !settings.skipPopover) {
				context.openDialog(EDITOR_POPOVER, resolve, reject, unlock, attachTo, scope, fcEvent, simpleEvent, calendar);
			} else {
				context.openDialog(EDITOR_SIDEBAR, resolve, reject, unlock, null, scope, fcEvent, simpleEvent, calendar);
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
