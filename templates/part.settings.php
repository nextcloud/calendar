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
				<label for="timezone" class="bold"><?php p($l->t('Timezone')); ?></label>
				<select id="timezone" name="timezone">
					<option ng-repeat="timezone in timezones">{{ timezone }}</option>
				</select>
			</li>
			<li>
				<input
					type="checkbox"
					name="timezonedetection"
					id="timezonedetection"
					ng-model="timezonedetection"
					ng-toggle="changetimezone"
				/>
				<label for="timezonedetection"><?php p($l->t('Update timezone automatically')); ?></label>
			</li>
			<li>
				<label for="timeformat" class="bold"><?php p($l->t('Time format')); ?></label>
				<select id="timeformat" title="<?php p("timeformat"); ?>" name="timeformat">
					<option
						ng-repeat="timeformat in timeformatSelect"
						id="{{ timeformat.val }}"
						value="{{ timeformat.val }}">
							{{ timeformat.time }}
					</option>
				</select>
			</li>
			<li>
				<label for="firstday" class="bold"><?php p($l->t('Start week on')); ?></label>
				<select id="firstday" title="<?php p("First day"); ?>" name="firstday">
					<option
							ng-repeat="firstday in firstdaySelect"
							id="{{ firstday.val }}"
							value="{{ firstday.val }}"
							ng-change="changefirstday()" ng-model="firstdaymodel">
								{{ firstday.day }}
					</option>
				</select>
			</li>
			<li>
				<label class="bold"><?php p($l->t('Cache')); ?></label>
				<input
					id="cleancalendarcache"
					type="button"
					class="button"
					value="<?php p($l->t('Clear cache for repeating events')); ?>"
					ng-click="cleancalendarcache()"
				/>
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
</div>
