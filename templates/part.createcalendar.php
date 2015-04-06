
<?php
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
?>
<div class="new-entity-container">


	<div
		class="new-entity"
		oc-click-slide-toggle="{
			selector: '.add-new',
			hideOnFocusLost: true,
			cssClass: 'opened'
		}"
		oc-click-focus="{
			selector: '.add-new input[ng-model=newCalendarInputVal]'
		}">
		<span class="new-entity-title"><?php p($l->t('New Calendar')); ?></span>
	</div>



	<fieldset class="calendarlist-fieldset add-new hide">
		<form>
			<input class="app-navigation-input" type="text" ng-model="newCalendarInputVal" autofocus />
			<button colorpicker="rgba" colorpicker-position="top" ng-model="newCalendarColorVal" id="newcolorpicker" style="background: {{ newCalendarColorVal }};"></button>
			<button
				ng-click="create(newCalendarInputVal,newCalendarColorVal)"
				id="submitnewCalendar"
				class="primary icon-checkmark-white"
				oc-click-slide-toggle="{
					selector: '.add-new',
					hideOnFocusLost: false,
					cssClass: 'closed'
				}">
			</button>
		</form>
	</fieldset>
</div>