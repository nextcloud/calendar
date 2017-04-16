/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
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

app.controller('EditorRecurrenceQuestionController', function($scope, $uibModalInstance) {
	"use strict";

	/**
	 * edit all events
	 */
	$scope.all = () => {
		$uibModalInstance.close({
			action: 'all'
		});
	};

	/**
	 * edit only this event
	 */
	$scope.onlyThis = () => {
		$uibModalInstance.close({
			action: 'onlyThis'
		});
	};

	/**
	 * edit this and all future event
	 */
	$scope.thisAndAllFuture = () => {
		$uibModalInstance.close({
			action: 'thisAndAllFuture'
		});
	};

	/**
	 * Cancel dialog via esc
	 */
	$scope.cancel = () => {
		$uibModalInstance.dismiss('cancel');
	};
});
