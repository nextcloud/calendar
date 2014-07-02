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
<li id="buttonarea">
	<div class="btn-group" id="togglebuttons">
		<button class="button" id="onedayview_radio" ng-click="changeview('agendaDay')"><?php p($l->t('Day')); ?></button>
		<button class="button" id="oneweekview_radio" ng-click="changeview('agendaWeek')"><?php p($l->t('Week')); ?></button>
		<button class="button" id="onemonthview_radio" ng-click="changeview('month')"><?php p($l->t('Month')); ?></button>
	</div>
	<button class="button" id="todaybutton" ng-click="todayview('today'); settodaytodatepicker()"><?php p($l->t('Today')); ?></button>
</li>
<li>
	<div
		id="newCalendar"	
		oc-click-slide-toggle="{
			selector: '.add-new',
			hideOnFocusLost: true,
			cssClass: 'opened'
		}"
		oc-click-focus="{
			selector: '.add-new input[ng-model=newCalendarInputVal]'
		}">
		<span><?php p($l->t('New Calendar')); ?></span>
	</div>
	<fieldset class="personalblock add-new">
		<form>
			<input type="text" ng-model="newCalendarInputVal" autofocus />
			<button colorpicker colorpicker-position="top" ng-model="newcolor" id="newcolorpicker" style="background: {{ newcolor }};"></button>
			<button
				ng-click="create(newCalendarInputVal,newcolor)"
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
</li>
<loading></loading>
<li ng-repeat="calendar in calendars|orderBy:'reverse'|filter: eventFilter()"
	ng-class="{ active: calendar.id == route.id }">
	<span class="calendarCheckbox" style="background-color:{{ calendar.color }}"></span>
	<a href="#/" ng-click="addRemoveEventSource(calendar.id)">
		{{ calendar.displayname }}
	</a>
	<span class="utils">
		<span class="action">
			<span
				id="chooseCalendar-share" 
				class="share icon-share permanent"
				data-item-type="calendar"
				data-item=""
				data-possible-permissions=""
				title="Share Calendar">
			</span>
		</span>
		<span class="action">
			<span id="chooseCalendar-showCalDAVURL" data-user="{{ calendar.ownwerid }}" data-caldav="" title="CalDav Link" class="icon-public permanent"></span>
		</span>
		<span class="action">
			<span
				id="chooseCalendar-download"
				title="Download"
				class="icon-download"
				ng-click="download(calendar.id)">
			</span>
		</span>
		<span class="action">
			<span id="chooseCalendar-edit" data-id="{{ calendar.uri }}" title="Edit" class="icon-rename"></span>
		</span>
		<span class="action">
			<span href="#"
				id="chooseCalendar-delete"
				data-id="{{ calendar.uri }}"
				title="Delete"
				class="icon-delete"
				ng-click="delete(calendar.id)">
			</span>
		</span>
	</span>
	<!-- form for sharing input -->
	<!--<fieldset class="personalblock share-dropdown">
		<form>
			<input type="text" ng-model="shareInputVal" autofocus />
			<button
				ng-click="share(shareInputVal,calendar.id )"
				class="primary"
				oc-click-slide-toggle="{
					selector: '.share-dropdown',
					hideOnFocusLost: false,
					cssClass: 'closed'
				}">
				<?php p($l->t('Share')); ?>
			</button>
		</form>
	</fieldset>-->
</li>
