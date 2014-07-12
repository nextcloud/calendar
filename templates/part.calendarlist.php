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
<ul id="calendarlist">
	<li ng-repeat="calendar in calendars| orderBy:['order'] | eventFilter | calendarFilter">
		<span class="calendarCheckbox" style="background-color:{{ calendar.color }}"></span>
		<a href="#/" ng-click="addRemoveEventSource(calendar.id)" data-id="{{ calendar.id }}">
			<span>{{ calendar.displayname }}</span>
		</a>
		<span class="utils">
			<span class="action" ng-class="{ disabled: !calendar.cruds.share }">
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
				<span 
					id="chooseCalendar-showCalDAVURL"
					data-user="{{ calendar.ownwerid }}"
					data-caldav=""
					title="CalDav Link"
					class="icon-public permanent"
					ng-click="caldavfieldset = !caldavfieldset; toggleCalDAV($index,calendar.uri,calendar.id)">
				</span>
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
				<span id="chooseCalendar-edit"
					data-id="{{ calendar.uri }}"
					title="Edit"
					class="icon-rename"
					ng-click="updatecalendarform($index,calendar.id,calendar.displayname,calendar.color);">
				</span>
			</span>
			<span class="action" ng-class="{ disabled: !calendar.cruds.delete }">
				<span href="#"
					id="chooseCalendar-delete"
					data-id="{{ calendar.uri }}"
					title="Delete"
					class="icon-delete"
					ng-click="delete(calendar.id)">
				</span>
			</span>
		</span>
		<fieldset ng-show="caldavfieldset" class="caldavURL">
			<input type="text" ng-model="calDAVmodel" data-id="{{ calendar.id }}" readonly />
			<button id="chooseCalendar-close" class="primary" ng-click="caldavfieldset = !caldavfieldset;">&lt;</button>
		</fieldset>
		<fieldset ng-show="editfieldset == calendar.id" class="editfieldset">
			<input type="text" ng-model="editmodel" data-id="{{ calendar.id }}" />
			<button 
				colorpicker="rgba" colorpicker-position="top" 
				ng-model="editcolor"
				id="editcolorpicker"
				style="background:{{ calendar.color }}">
			</button>
			<div class="calendartype">
				<input type="checkbox" ng-model="vevent" />
				<label><?php p($l->t('Event')); ?></label>
				<input type="checkbox" ng-model="vjournal" />
				<label><?php p($l->t('Journal')); ?></label>
				<input type="checkbox" ng-model="vtodo" />
				<label><?php p($l->t('Todo')); ?></label>
			</div>
			<div class="buttongroups">
				<button
					ng-click="update(calendar.id,editmodel,editcolor, vevent, vjournal, vtodo); editfieldset = null;"
					id="updateCalendar"
					class="primary icon-checkmark-white">
				</button>
				<button id="chooseCalendar-close" class="primary" ng-click="editfieldset = false">&lt;</button>
			</div>
		</fieldset>
	</li>
</ul>
