
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
<div class="new-entity-container">


	<div
		class="new-entity"
		data-apps-slide-toggle=".add-new"
		id="new-calendar-button">
		<span class="new-entity-title" role="button"><?php p($l->t('New Calendar')); ?></span>
	</div>



	<fieldset class="calendarlist-fieldset add-new hide">
		<form ng-submit="create(newCalendarInputVal,selected)">
			<input class="app-navigation-input" type="text" ng-model="newCalendarInputVal" autofocus placeholder="<?php p($l->t('Name')); ?>"/>
			<colorpicker class="colorpicker" selected="selected"></colorpicker>
			<button
				id="submitnewCalendar"
				class="primary accept-button new-accept-button"
				oc-click-slide-toggle="{
					selector: '.add-new',
					hideOnFocusLost: false,
					cssClass: 'closed'
				}">
				<?php p($l->t('Create')); ?>
			</button>
		</form>
	</fieldset>
</div>
