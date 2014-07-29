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

<div id="app-settings-header">
	<button name="app settings"
		class="settings-button"
		oc-click-slide-toggle="{
			selector : '#app-settings-content',
			hideOnFocusLost: true,
			cssClass: 'opened'
		}">
	</button>
</div>

<div id="app-settings-content">
	<fieldset class="personalblock">
		<ul>
			<li>
				<label for="timeformat" class="bold"><?php p($l->t('Time format')); ?></label>
				<select
					id="timeformat" name="timeformat"
					title="<?php p("timeformat"); ?>"
					ng-model="selectedtime"
					ng-selected="selectedtime"
					ng-change="changetimeformat(selectedtime)"
					ng-options="timeformat.time for timeformat in timeformatSelect"
					data-timeFormat="<?php p(OCP\Config::getUserValue(OCP\User::getUser(), 'calendar', 'timeformat', '24')); ?>">
				</select>
			</li>
			<li>
				<label for="firstday" class="bold"><?php p($l->t('Start week on')); ?></label>
				<select
					id="firstday" name="firstday"
					title="<?php p("First day"); ?>"
					ng-model="selectedday"
					ng-selected="selectedday"
					ng-change="changefirstday(selectedday)"
					ng-options="firstday.day for firstday in firstdaySelect"
					data-firstDay="<?php p(OCP\Config::getUserValue(OCP\User::getUser(), 'calendar', 'firstday', 'mo')); ?>">
				</select>
			</li>
			<li>
				<label class="bold"><?php p($l->t('Show in Calendar')); ?></label>
				<select id="hiddencalendar" name="hiddencalendar"
					ng-model="hiddencalendar"
					ng-change="enableCalendar(hiddencalendar.id)"
					ng-options="hiddencalendar.displayname for hiddencalendar in calendars | noteventFilter">
				</select>
			</li>
			<li id="uploadarea">
				<label class="bold"><?php p($l->t('Upload Calendar')); ?></label>
				<input type="file" name="file" accept="text/calendar" multiple upload modal="importdialog" id="import" />
				<span href="#" class="svg icon-upload" id="uploadicon"></span>
				<span ng-show="!files.length" class="hide"><?php p($l->t('No Calendars selected for import')); ?></span>
			</li>
			<li>
				<label class="bold"><?php p($l->t('Primary CalDAV address')); ?></label>
				<input
					id="primarycaldav"
					type="text"
					value="<?php print_unescaped(OCP\Util::linkToRemote('caldav')); ?>"
				/>
			</li>
			<li>
				<label class="bold"><?php p($l->t('iOS/OS X CalDAV address')); ?></label>
				<input
					id="ioscaldav"
					type="text"
					value="<?php print_unescaped(OCP\Util::linkToRemote('caldav')); ?>principals/<?php p(urlencode(OCP\USER::getUser())); ?>/"
					/>
			</li>
		</ul>
	</fieldset>
	<div id="importdialog" title="<?php p($l->t("Import Calendars"));?>">
		<ul>
			<li ng-repeat="file in files">
				<span>{{ file }}</span>
				<select id="importcalendarist" name="importcalendarlist"
					ng-model="importcalendar"
					ng-change="import(importcalendar.id)"
					ng-options="calendar.displayname for calendar in calendars | orderBy:['order'] | eventFilter | calendarFilter">
				</select>
			</li>
		</ul>
	</div>
</div>
