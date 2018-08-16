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

<li class="new-entity-container" ng-class="{'editing': addingSub}">

	<a class="new-entity icon-add" ng-click="openNewSubscriptionForm()" id="new-subscription-button">
		<?php p($l->t('New Subscription')); ?>
	</a>

	<div class="app-navigation-entry-edit calendarlist-fieldset add-new hide">
		<form ng-submit="createSubscription(subscription.newSubscriptionUrl)">
			<input
				class="app-navigation-input"
				type="text"
				ng-disabled="subscription.newSubscriptionLocked"
				ng-model="subscription.newSubscriptionUrl"
				placeholder="<?php p($l->t('iCal link')); ?>"
				autofocus />
			<span class="add-new-is-processing icon-loading-small"
				  ng-class="{'hidden': !subscription.newSubscriptionLocked}"></span>
			<input
				type="button" value=""
				class="icon-close"
				ng-click="dismissNewSubscription()"
				ng-disabled="subscription.newSubscriptionLocked" />
			<input
				id="submitnewSubscription"
				class="accept-button icon-checkmark"
				ng-disabled="subscription.newSubscriptionLocked"
				oc-click-slide-toggle="{
						selector: '.add-new-subscription',
						hideOnFocusLost: false,
						cssClass: 'closed'
					}"
				type="submit"
				value="" />
		</form>
	</div>
</li>
