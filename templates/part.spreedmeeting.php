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

<?php if (!$_['isSpreedAvailable']) {
	p($l->t('The Spreed "Video calls" app is not available. Please ask your system administrator to install it.'));
	// TODO(leon): Include link to app store (https://apps.nextcloud.com/apps/spreed)
} else {?>

<input type="checkbox" name="spreedmeetingcreatecheckbox"
	ng-model="properties.doScheduleMeeting"
	id="spreedmeetingcreatecheckbox" class="checkbox" />
<label for="spreedmeetingcreatecheckbox">
	<?php p($l->t('Schedule Spreed Meeting for this event'));?>
</label>

<div ng-show="properties.doScheduleMeeting">
	<label>
		<?php p($l->t('Meeting type:'));?>
		<select class="event-select pull-left"
			ng-model="properties.spreedmeeting.parameters.type"
			ng-selected="properties.spreedmeeting.parameters.type"
			ng-options="t.val as t.displayname for t in properties.meetingTypes" />
		</select>
	</label>
</div>

<?php }?>
