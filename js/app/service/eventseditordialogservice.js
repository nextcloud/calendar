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

app.service('EventsEditorDialogService', function($uibModal) {
	'use strict';

		var EDITOR_POPOVER = 'eventspopovereditor.html';
		var EDITOR_SIDEBAR = 'eventssidebareditor.html';
		var REPEAT_QUESTION = ''; //TODO in followup PR

		var self = this;

		self.calendar = null;
		self.eventModal = null;
		self.fcEvent = null;
		self.promise = null;
		self.scope = null;
		self.simpleEvent = null;
		self.unlockCallback = null;

		function cleanup() {
			self.calendar = null;
			self.eventModal = null;
			self.fcEvent = null;
			self.promise = null;
			self.scope = null;
			self.simpleEvent = null;
		}

		function openDialog (template, position, rejectDialog, resolveDialog) {
			self.eventModal = $uibModal.open({
				templateUrl: template,
				controller: 'EditorController',
				windowClass: (template === EDITOR_POPOVER) ? 'popover' : null,
				appendTo: (template === EDITOR_POPOVER) ?
					angular.element('#popover-container') :
					angular.element('#app-content'),
				resolve: {
					vevent: function() {
						return self.fcEvent.vevent;
					},
					simpleEvent: function() {
						return self.simpleEvent;
					},
					calendar: function() {
						return self.calendar;
					},
					isNew: function() {
						return (self.fcEvent.vevent.etag === null);
					},
					emailAddress: function() {
						return angular.element('#fullcalendar').attr('data-emailAddress');
					}
				},
				scope: self.scope
			});

			if (template === EDITOR_SIDEBAR) {
				angular.element('#app-content').addClass('with-app-sidebar');
			}

			self.eventModal.rendered.then(function(result) {
				angular.element('#popover-container').css('display', 'none');
				angular.forEach(position, function(v) {
					angular.element('.modal').css(v.name, v.value);
				});
				angular.element('#popover-container').css('display', 'block');
			});

			self.eventModal.result.then(function(result) {
				if (result.action === 'proceed') {
					self.calendar = result.calendar;
					openDialog(EDITOR_SIDEBAR, null, rejectDialog, resolveDialog);
				} else {
					if (template === EDITOR_SIDEBAR) {
						angular.element('#app-content').removeClass('with-app-sidebar');
					}

					self.unlockCallback();
					resolveDialog({
						calendar: result.calendar,
						vevent: result.vevent
					});
					cleanup();
				}
			}).catch(function(reason) {
				if (template === EDITOR_SIDEBAR) {
					angular.element('#app-content').removeClass('with-app-sidebar');
				}

				if (reason !== 'superseded') {
					self.unlockCallback();
					cleanup();
				}

				rejectDialog(reason);
			});
		}

		function openRepeatQuestion() {
			//TODO in followup PR
		}

		this.open = function(scope, fcEvent, positionCallback, lockCallback, unlockCallback) {
			//don't reload editor for the same event
			if (self.fcEvent === fcEvent) {
				return self.promise;
			}

			//is an editor already open?
			if (self.fcEvent) {
				self.eventModal.dismiss('superseded');
			}

			cleanup();
			self.promise = new Promise(function(resolve, reject) {
				self.fcEvent = fcEvent;
				self.simpleEvent = fcEvent.getSimpleEvent();
				if (fcEvent.vevent) {
					self.calendar = fcEvent.vevent.calendar;
				}
				self.scope = scope;

				//calculate position of popover
				var position = positionCallback();

				//lock new fcEvent and unlock old fcEvent
				lockCallback();
				if (self.unlockCallback) {
					self.unlockCallback();
				}
				self.unlockCallback = unlockCallback;

				//skip popover on small devices
				if (angular.element(window).width() > 768) {
					openDialog(EDITOR_POPOVER, position, reject, resolve);
				} else {
					openDialog(EDITOR_SIDEBAR, null, reject, resolve);
				}
			});

			return self.promise;
	};

	return this;
});