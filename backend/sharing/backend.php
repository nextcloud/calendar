<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
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
namespace OCA\Calendar\Backend\Sharing;

use OCA\Calendar\Backend\SubscriptionInvalidException;
use OCP\Share;

use OCP\Calendar\IBackendAPI;
use OCP\Calendar\ISubscription;

class Backend implements IBackendAPI {

	/**
	 * returns whether or not a backend can be enabled
	 * @return boolean
	 */
	public function canBeEnabled() {
		return Share::isEnabled();
	}


	/**
	 * get information about supported subscription-types
	 * @return array
	 */
	public function getSubscriptionTypes() {
		return [];
	}


	/**
	 * validate a subscriptions validity
	 * @param ISubscription $subscription
	 * @throws SubscriptionInvalidException
	 * @return boolean
	 */
	public function validateSubscription(ISubscription &$subscription) {
		throw new SubscriptionInvalidException('Subscription is not supported');
	}


	/**
	 * get translated string for createOn dialog
	 * @return array
	 */
	public function getAvailablePrefixes() {
		return [];
	}


	/**
	 * Can a backend store a calendar's color?
	 * @return boolean
	 */
	public function canStoreColor() {
		return false;
	}


	/**
	 * returns whether or not a backend can store a
	 * calendar's supported components
	 * @return boolean
	 */
	public function canStoreComponents() {
		return false;
	}


	/**
	 * Can a backend store a calendar's description?
	 * @return boolean
	 */
	public function canStoreDescription() {
		return false;
	}


	/**
	 * returns whether or not a backend can store a calendar's displayname
	 * @return boolean
	 */
	public function canStoreDisplayname() {
		return false;
	}


	/**
	 * returns whether or not a backend can store if a calendar is enabled
	 * @return boolean
	 */
	public function canStoreEnabled() {
		return false;
	}


	/**
	 * returns whether or not a backend can store a calendar's order
	 * @return boolean
	 */
	public function canStoreOrder() {
		return false;
	}
}