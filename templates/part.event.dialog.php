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

<div id="events" title="<?php p($l->t("View an event"));?>"          
	open="{{dialogOpen}}" 
	ok-button="OK"
	ok-callback="handleOk"
	cancel-button="Cancel"
	cancel-callback="handleCancel"
	ng-init="advancedoptions = true;">
	<fieldset>
		<label class="bold"><?php p($l->t('Title')); ?></label>
		<input ng-model="eventstitle" ng-maxlength="100" type="text" id="event-title"
			placeholder="<?php p($l->t('Title of the Event'));?>" name="title" autofocus="autofocus" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Location')); ?></label>
		<input ng-model="eventslocation" placeholder="" type="text" id="event-location"
			placeholder="<?php p($l->t('Events Location'));?>" name="location" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Categories')); ?></label>
		<input ng-model="eventscategories" placeholder="" type="text" id="event-categories"
			placeholder="<?php p($l->t('Separate Categories with comma'));?>" name="categories" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Description')); ?></label>
		<input ng-model="eventsdescription" placeholder="" type="text" id="event-description"
			placeholder="<?php p($l->t('Description'));?>" name="description" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Description')); ?></label>
		<input ng-model="eventsdescription" placeholder="" type="text" id="event-description"
			placeholder="<?php p($l->t('Description'));?>" name="description" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Repeating')); ?></label>
		<select
			id="recurrence" name="recurrence"
			title="<?php p("Recurrence"); ?>"
			ng-model="recurrence"
			ng-change="changerecurrence(recurrence.id)"
			ng-options="recurrence.val for recurrence in recurrenceSelect">
		</select>
	</fieldset>
	<fieldset>
		<textarea id="repeatdialog"></textarea>
	</fieldset>
	<fieldset>
		<button id="eventupdatebutton" ng-click="update()" class="btn primary">
			<?php p($l->t('Update')); ?>
		</button>
		<button id="advanced_options_button" ng-click="advancedoptions = !advancedoptions">
			<?php p($l->t('Advanced options')); ?>
		</button>
	</fieldset>
	<div ng-hide="advancedoptions" id="advancedoptions">
		<p>yoyo</p>
	</div>
</div>
