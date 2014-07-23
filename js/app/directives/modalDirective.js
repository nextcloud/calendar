/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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

app.directive('modal', function ($timeout) {
	return {
		scope: {
			okButton: '@',
			okCallback: '=',
			cancelButton: '@',
			cancelCallback: '=',
			open: '@',
			title: '@',
			width: '@',
			height: '@',
			show: '@',
			hide: '@',
			autoOpen: '@',
			resizable: '@',
			closeOnEscape: '@',
			hideCloseButton: '@'
		},
		replace:false,
		transclude: false,
		template: OC.filePath('calendar', 'templates', 'part.event.dialog.php'),
		link: function (scope, element, attrs) {
			// Close button is hidden by default
			var hideCloseButton = attrs.hideCloseButton || true;
			// Specify the options for the dialog
			var dialogOptions = {
				autoOpen: attrs.autoOpen || false,
				title: attrs.title,
				width: attrs.width || 350,
				height: attrs.height || 200, 
				modal: attrs.modal || false,
				show: attrs.show || '',
				hide: attrs.hide || '',
				draggable: attrs.draggable || true,
				resizable: attrs.resizable,
				closeOnEscape: attrs.closeOnEscape || false,
				close: function() {

				},
				open: function(event, ui) { 
					// Hide close button 
					if(hideCloseButton === true) {
						$(".ui-dialog-titlebar-close", ui.dialog).hide();
					}
				} 
			};
         
			// Add the buttons 
			dialogOptions.buttons = [];
			btnOptions = {};
			if (attrs.okButton) {
				btnOptions = {
					text: attrs.okButton,
					click: function() {
						scope.$apply(scope.okCallback());
					}
				};
				dialogOptions.buttons.push(btnOptions);    
			}
			if (attrs.cancelButton) {
				btnOptions = {
					text: attrs.cancelButton,
					click: function() {
						scope.$apply(scope.cancelCallback());
					}
				};
				dialogOptions.buttons.push(btnOptions);
			}

			// Initialize the element as a dialog
			// For some reason this timeout is required, otherwise it doesn't work
			// for more than one dialog

			$timeout(function() {
				$(element).dialog(dialogOptions);
			},0);

			// This works when observing an interpolated attribute
			// e.g {{dialogOpen}}.  In this case the val is always a string and so
			// must be compared with the string 'true' and not a boolean
			// using open: '@' and open="{{dialogOpen}}"
			attrs.$observe('open', function (val) {
				if (val == 'true') {
					$(element).dialog("open");
				} else {
					$(element).dialog("close");
				}
			});

			// This allows title to be bound
			attrs.$observe('title', function (val) {
				$(element).dialog("option", "title", val);                   
			});
		}
	};
});  