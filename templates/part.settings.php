<?php
/**
 * ownCloud - Calendar App
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

<div id="app-settings-header">
	<button name="app settings"
		class="settings-button"
		data-apps-slide-toggle="#app-settings-content">
		<?php p($l->t('Settings')); ?>
	</button>
</div>

<div id="app-settings-content">
	<fieldset class="settings-fieldset">
		<ul class="settings-fieldset-interior">
			<li class="settings-fieldset-interior-item">
				<label>
					<input type="checkbox" ng-change="updateSkipPopover()" ng-model="skipPopover" ng-true-value="'yes'" ng-false-value="'no'"/>
					<?php p($l->t('Skip simple event editor')); ?>
				</label>
			</li>
			<li class="settings-fieldset-interior-item settings-fieldset-interior-upload">
				<input type="file" name="file" accept="text/calendar" multiple id="import" />
				<span href="#" class="settings-upload svg icon-upload"><?php p($l->t('Import calendar')); ?></span>
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