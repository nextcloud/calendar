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
	<li ng-repeat="calendar in calendars| orderBy:['order'] | eventFilter | calendarFilter"
		ng-class="">
		<span class="calendarCheckbox" style="background-color:{{ calendar.color }}"></span>
		<a href="#/" ng-click="addRemoveEventSource(calendar.id)" data-id="{{ calendar.id }}">
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
</ul>
