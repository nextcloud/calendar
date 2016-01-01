<?php
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
?>

<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('Repeat'))?></label>
	<select ng-model="repeatmodel" ng-options="repeat as repeat.displayname for repeat in repeater" ng-change="changerepeater(repeatmodel)">
	</select>
	<select ng-hide="monthday" ng-model="monthdaymodel" ng-options="day as day.displayname for day in monthdays" ng-change="changemonthday(monthdaymodel)">
	</select>
	<select ng-hide="yearly" ng-model="yearmodel" ng-options="year as year.displayname for year in years" ng-change="changeyear(yearmodel)">
	</select>
	<select ng-hide="weekly" ng-model="weekmodel" id="weeklyselect" ng-change="changeweek(weekmodel)" multiple="multiple" data-placeholder="yoll" title="yol">
		<option ng-repeat="week in weeks" value="{{ week.val }}"> {{ week.displayname }}</option>
	</select>
</fieldset>




<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('Interval'))?></label>
	<input type="number" min="1" max="1000" value="1" name="interval" ng-model="intervalmodel">
</fieldset>



<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('End'))?></label>
	<select>
		<option ng-repeat="end in ender" value="end.val" ng-model="end.val">{{ end.displayname }}</option>
	</select>
</fieldset>
