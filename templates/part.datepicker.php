<?php
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
?>
<div class="datepicker-heading">
	<a href="#" class="icon-view-previous" ng-click="prev()" aria-label="<?php p($l->t('Go back')) ?>"></a>
	<button ng-cloak type="button" class="button middle" ng-click="toggle()">
		{{ dt | datepickerFilter:selectedView }}
	</button>
	<a href="#" class="icon-view-next" ng-click="next()" aria-label="<?php p($l->t('Go forward')) ?>"></a>
</div>
<div id="datepicker-ng-show-container" class="ng-hide" ng-show="visibility">
	<div
		ng-model="dt"
		id="datepicker"
		uib-datepicker
		datepicker-options="datepickerOptions">
	</div>
</div>
