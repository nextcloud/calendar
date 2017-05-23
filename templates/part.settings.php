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

<div id="app-settings-header">
	<button name="app settings"
		class="settings-button"
		data-apps-slide-toggle="#app-settings-content">
		<?php p($l->t('Settings & import')); ?>
	</button>
</div>

<div id="app-settings-content">
	<fieldset class="settings-fieldset">
		<ul class="settings-fieldset-interior">
			<li class="settings-fieldset-interior-item">
				<input class="checkbox" type="checkbox" ng-change="updateSkipPopover()" ng-model="skipPopover" ng-true-value="'yes'" ng-false-value="'no'" id="skip_popover_checkbox"/>
				<label for="skip_popover_checkbox">
					<?php p($l->t('Skip simple event editor')); ?>
				</label>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-weeknumbers">
				<input class="checkbox" type="checkbox" ng-change="updateShowWeekNr()" ng-model="settingsShowWeekNr" ng-true-value="'yes'" ng-false-value="'no'" id="show_weeknumbers_checkbox"/>
				<label for="show_weeknumbers_checkbox">
					<?php p($l->t('Show week numbers')); ?>
				</label>
			</li>
      <li class="settings-fieldset-interior-item settings-fieldset-interior-startofweek">
        <label for="show_startofweek_select">
					<?php p($l->t('Start of week')); ?>
				</label>
				<select class="checkbox" type="checkbox" ng-change="updateStartOfWeek()" ng-model="settingsStartOfWeek" id="show_startofweek_select">
          <option value=""><?php p($l->t('From language')); ?></option>
          <option value="1"><?php p($l->t('Monday')); ?></option>
          <option value="2"><?php p($l->t('Tuesday')); ?></option>
          <option value="3"><?php p($l->t('Wednesday')); ?></option>
          <option value="4"><?php p($l->t('Thursday')); ?></option>
          <option value="5"><?php p($l->t('Friday')); ?></option>
          <option value="6"><?php p($l->t('Saturday')); ?></option>
          <option value="0"><?php p($l->t('Sunday')); ?></option>
        </select>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-upload">
				<input type="file" name="file" accept="text/calendar" multiple id="import" />
				<span href="#" class="settings-upload svg icon-upload" role="button" id="import-button-overlay"><?php p($l->t('Import calendar')); ?></span>
				<span ng-show="!files.length" class="hide"><?php p($l->t('No Calendars selected for import')); ?></span>
			</li>

			<li class="settings-fieldset-interior-item">
				<label class="settings-input"><?php p($l->t('Primary CalDAV address')); ?></label>
				<input class="input settings-input" type="text" ng-model="settingsCalDavLink" readonly />
			</li>
			<li class="settings-fieldset-interior-item">
				<label class="settings-label"><?php p($l->t('iOS/OS X CalDAV address')); ?></label>
				<input class="input settings-input" type="text" ng-model="settingsCalDavPrincipalLink" readonly />
			</li>
		</ul>
	</fieldset>
</div>
