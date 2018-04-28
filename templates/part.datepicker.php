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
<?php if(!$_['isPublic']): ?>
<div class="datepicker-heading">
	<button type="button" class="button first" ng-click="prev()" aria-label="<?php p($l->t('Go back')) ?>">
		<i class="glyphicon glyphicon-chevron-left"></i>
	</button>
	<button ng-cloak type="button" class="button middle" ng-click="toggle()">
		{{ dt | datepickerFilter:selectedView }}
	</button>
	<button type="button" class="button last" ng-click="next()" aria-label="<?php p($l->t('Go forward')) ?>">
		<i class="glyphicon glyphicon-chevron-right"></i>
	</button>
</div>
<div id="datepicker-ng-show-container" class="ng-hide" ng-show="visibility">
	<div
		ng-model="dt"
		id="datepicker"
		uib-datepicker
		datepicker-options="datepickerOptions">
	</div>
</div>
<?php endif; ?>


<?php if($_['rendering'] == 'rendering'): ?>
	<button type="button" class="button first" ng-click="prev()"> <?php p($l->t('<<')); ?>
		
	</button>
	<button ng-cloak type="button" class="button middle" ng-click="toggle()">
		{{ dt | datepickerFilter:selectedView }}
	</button>
	<button type="button" class="button last" ng-click="next()"> <?php p($l->t('>>')); ?>
		
	</button>
	<button class="button first" ng-value="agendaDay" ng-model="selectedView" uib-btn-radio="'agendaDay'"><?php p($l->t('Day')); ?></button>
	<button class="button middle" ng-value="agendaWeek" ng-model="selectedView" uib-btn-radio="'agendaWeek'"><?php p($l->t('Week')); ?></button>
	<button class="button last" ng-value="month" ng-model="selectedView" uib-btn-radio="'month'"><?php p($l->t('Month')); ?></button>

	<button class="button today" ng-click="today()"><?php p($l->t('Today')); ?></button>
	


<?php endif; ?>

<?php if($_['isPublic'] && $_['rendering'] !== 'rendering' ): ?>
<div class="datepicker-heading">
	<button type="button" class="button first" ng-click="prev()" aria-label="<?php p($l->t('Go back')) ?>">
		<i class="glyphicon glyphicon-chevron-left"></i>
	</button>
	<button ng-cloak type="button" class="button middle" ng-click="toggle()">
		{{ dt | datepickerFilter:selectedView }}
	</button>
	<button type="button" class="button last" ng-click="next()" aria-label="<?php p($l->t('Go forward')) ?>">
		<i class="glyphicon glyphicon-chevron-right"></i>
	</button>
</div>
<div id="datepicker-ng-show-container" class="ng-hide" ng-show="visibility">
	<div
		ng-model="dt"
		id="datepicker"
		uib-datepicker
		datepicker-options="datepickerOptions">
	</div>
</div>

<div class="togglebuttons">
	<button class="button first" ng-value="agendaDay" ng-model="selectedView" uib-btn-radio="'agendaDay'"><?php p($l->t('Day')); ?></button>
	<button class="button middle" ng-value="agendaWeek" ng-model="selectedView" uib-btn-radio="'agendaWeek'"><?php p($l->t('Week')); ?></button>
	<button class="button last" ng-value="month" ng-model="selectedView" uib-btn-radio="'month'"><?php p($l->t('Month')); ?></button>
</div>
<div class="togglebuttons">
	<button class="button today" ng-click="today()"><?php p($l->t('Today')); ?></button>
</div>


<?php endif; ?>

<?php if($_['isPublic'] && $_['rendering'] == 'schedule' ): ?>
	<div style="text-align: center;">
		<b>Instructions</b><br>
		Please select <b>1</b> time slot, <br>write your name or email and <br>then click Confirm
	</div>
<?php endif; ?>

