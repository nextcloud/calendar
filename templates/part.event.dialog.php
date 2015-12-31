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

<div id="events"
	title="<?php p($l->t("Edit event")); ?>"
	open="{{dialogOpen}}"
	ok-button="OK"
	ok-callback="handleOk"
	cancel-button="Cancel"
	cancel-callback="handleCancel"
	ng-init="monthday = true; yearly = true;">
	<form id="event_form">
		<div class="tabs">
			<ul>
				<li class="tab pull-left" ng-repeat="tab in tabs"
					ng-click="tabopener(tab.value)" ng-class="{active: tab.value == selected}">
					{{tab.title}}
				</li>
			</ul>
    	</div>

		<div class="events-container">
			<div ng-include="currentTab"></div>
		</div>

		<div ng-show="eventsinfoview">
			<?php print_unescaped($this->inc('part.eventsinfo')); ?>
		</div>

		<div ng-show="eventsattendeeview">
			<?php print_unescaped($this->inc('part.eventsattendees')); ?>
		</div>

		<div ng-show="eventsalarmview">
			<?php print_unescaped($this->inc('part.eventsalarms')); ?>
		</div>

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
