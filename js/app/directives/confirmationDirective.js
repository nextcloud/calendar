/**
 * Nextcloud - calendar
 *
 * @author Raimund Schlüßler
 * @copyright 2016 Raimund Schlüßler <raimund.schluessler@googlemail.com>
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

app.directive('confirmation', function() {
	'use strict';
	return {
		priority: -1,
		restrict: 'A',
		templateUrl: 'confirmation.html',
		scope: {
			confirmationFunction: "&confirmation",
			confirmationMessage: "&confirmationMessage",

		},
		controller: 'ConfirmationController'
	};
});

app.controller('ConfirmationController', [
	'$scope', '$rootScope', '$element', '$attrs', '$compile', '$document', '$window', '$timeout', function($scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout) {
		'use strict';
		var ConfirmationController = (function() {
			function ConfirmationController(_$scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout) {
				this._$scope = _$scope;
				this._$scope.countdown = 3;

				$element.bind( 'click', function( e ){
					_$scope.countdown = 3;
					$element.removeClass('active');
					var message = _$scope.confirmationMessage() ? _$scope.confirmationMessage() : "Are you sure?";
					if ($element.hasClass('confirmed')) {
						return;
					}
					e.stopPropagation();
					_$scope.activate();
					$element.children('.confirmation-confirm')
						.tooltip({title: message, container: 'body', placement: 'right'});
					$element.addClass("confirmed");
				});

				$element.children('.confirmation-confirm').bind( 'click', function (e) {
					if ($element.hasClass('confirmed active')) {
						_$scope.confirmationFunction();
						return;
					} else{
						e.stopPropagation();
					}
				});

				this._$scope.documentClick = function () {
					$element.removeClass("confirmed");
				};

				this._$scope.activate = function () {
					if (_$scope.countdown) {
						$element.find('.countdown').html(_$scope.countdown+' s');
						$timeout(function() {
							_$scope.activate();
						}, 1000);
						_$scope.countdown--;
					} else {
						$element.addClass('active');
					}
				};

				$document.bind('click', _$scope.documentClick);
				$document.bind('touchend', _$scope.documentClick);

				$scope.$on('$destroy', function() {
					$document.unbind('click', _$scope.documentClick);
					$document.unbind('touchend', _$scope.documentClick);
				});
			}
			return ConfirmationController;
		})();
		return new ConfirmationController($scope, $rootScope, $element, $attrs, $compile, $document, $window, $timeout);
	}
]);
