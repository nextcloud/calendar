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

<div class="new-entity-container">
	<div
		class="new-entity"
		data-apps-slide-toggle=".add-new-subscription"
		id="new-subscription-button">
		<span class="new-entity-title"><?php p($l->t('New Subscription')); ?></span>
	</div>

	<fieldset class="calendarlist-fieldset add-new-subscription hide">
		<form ng-submit="createSubscription(subscription.newSubscriptionUrl)">
			<input
				class="app-navigation-input"
				type="text"
				ng-disabled="subscription.newSubscriptionLocked"
				ng-model="subscription.newSubscriptionUrl"
				placeholder="<?php p($l->t('WebCal-URL')); ?>"
				autofocus />
			<input
				id="submitnewSubscription"
				class="primary accept-button"
				ng-disabled="subscription.newSubscriptionLocked"
				oc-click-slide-toggle="{
						selector: '.add-new-subscription',
						hideOnFocusLost: false,
						cssClass: 'closed'
					}"
				type="submit"
				value="<?php p($l->t('Create')); ?>" />
		</form>
	</fieldset>
</div>
