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

<div id="events"
	title="<?php p($l->t("Edit event")); ?>"
	open="{{dialogOpen}}"
	ok-button="OK"
	ok-callback="handleOk"
	cancel-button="Cancel"
	cancel-callback="handleCancel"
	ng-init="monthday = true; yearly = true;">
	<form id-"event_form">
		<div class="tabs">
			<ul>
				<li class="tab pull-left" ng-repeat="tab in tabs"
					ng-class="{active:isActiveTab(tab.url)}"
					ng-click="onClickTab(tab)">{{tab.title}}</li>
      </ul>
    </div>

		<div class="events-container">
			<div ng-include="currentTab"></div>
		</div>

			<script type="text/ng-template" id="event.info.html">
				<?php print_unescaped($this->inc('part.eventsinfo')); ?>
			</script>

			<script type="text/ng-template" id="event.repeat.html">
				<?php print_unescaped($this->inc('part.eventsrepeat')); ?>
			</script>

			<script type="text/ng-template" id="event.attendees.html">
				<?php print_unescaped($this->inc('part.eventsattendees')); ?>
			</script>

			<script type="text/ng-template" id="event.alarms.html">
				<?php print_unescaped($this->inc('part.eventsalarms')); ?>
			</script>

		<div class="events-container">
			<fieldset class="event-fieldset pull-left">
				<button ng-click="delete()" class="event-button button btn">
					<?php p($l->t('Delete Event')); ?>
				</button>
			</fieldset>


			<fieldset class="event-fieldset pull-right">
				<button ng-click="update()" class="event-button button btn primary">
					<?php p($l->t('Save Event')); ?>
				</button>
			</fieldset>
		</div>
	</form>
</div>
