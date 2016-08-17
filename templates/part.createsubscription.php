<?php
/**
 * Calendar App
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

<div class="new-entity-container" ng-show="(calendars | subscriptionFilter).length > 0">

	<div class="subscription-title">
		<span class="new-entity-title"><?php p($l->t('Subscriptions')); ?></span>
	</div>
	<!--
	<div
		class="new-entity"
		data-apps-slide-toggle=".add-new-subscription">
		<span class="new-entity-title"><?php p($l->t('New Subscription')); ?></span>
	</div>



	<fieldset class="calendarlist-fieldset add-new-subscription hide">
		<form>
			<fieldset class="calendarlist-fieldset">
				<input
					class="calendarlist-input pull-left"
					type="text"
					ng-model="newSubscriptionUrl"\
					placeholder="<?php p($l->t('Url')); ?>"
					autofocus />
				<select id="subscription pull-left"
					name="subscription"
					ng-model="selectedsubscriptionbackendmodel"
					ng-options="subscription.name for subscription in subscriptiontypeSelect"
					ng-selected="selectedsubscriptionbackend.type">
				</select>
				<button
					ng-click="create(newSubscriptionUrl)"
					id="submitnewSubscription"
					class="primary accept-button"
					oc-click-slide-toggle="{
						selector: '.add-new-subscription',
						hideOnFocusLost: false,
						cssClass: 'closed'
					}">
					<?php p($l->t('Create')); ?>
				</button>
			</fieldset>
		</form>
	</fieldset>
	-->
</div>
