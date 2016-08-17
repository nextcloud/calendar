<?php
/**
 * Calendar App
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

<fieldset ng-show="rruleNotSupported">
	<span><?php p($l->t('This event\'s repeating rule is not supported yet.')); ?></span>
	<span class="hint"><?php p($l->t('Support for advanced rules will be added with subsequent updates.')); ?></span>
	<button ng-click="resetRRule()"><?php p($l->t('Reset repeating rule')); ?></button>
</fieldset>

<fieldset ng-hide="rruleNotSupported">
	<select
		id="frequency_select"
		ng-options="repeat.val as repeat.displayname for repeat in repeat_options_simple"
		ng-model="properties.rrule.freq">
	</select>
</fieldset>



<fieldset class="event-fieldset" ng-hide="properties.rrule.freq === 'NONE' || rruleNotSupported">
	<label class="pull-left">
		<?php p($l->t('Repeat every ...')); ?>
	</label>
	<input
		class="pull-right pull-half"
		type="number"
		min="1"
		ng-model="properties.rrule.interval">
	<div class="clear-both"></div>
	<label class="pull-left inline">
		<?php p($l->t('end repeat ...')); ?>
	</label>
	<div class="pull-right pull-half">
		<select id="frequency_select"
				ng-options="repeat.val as repeat.displayname for repeat in repeat_end"
				ng-model="selected_repeat_end">
		</select>
	</div>
	<div class="clear-both"></div>
	<div class="pull-right pull-half" ng-show="selected_repeat_end === 'COUNT'">
		<input type="number" min="1" ng-model="properties.rrule.count">
		<?php p($l->t('times')); ?>
	</div>
	<!--
	<div class="pull-right pull-half" ng-show="selected_repeat_end === 'UNTIL'">
		<ocdatetimepicker ng-model="properties.rrule.until"></ocdatetimepicker>
	</div>
	-->
</fieldset>
