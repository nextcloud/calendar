<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus <thomas@tanghus.net>
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
namespace OCA\Calendar\Backend\Contact;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\ISubscription;

class Backend extends Contact implements BackendUtils\IBackendAPI {

	/**
	 * {@inheritDoc}
	 */
	public function canBeEnabled() {
		$addressBooks = $this->contacts->getAddressBooksForUser();
		return !empty($addressBooks);
	}


	/**
	 * {@inheritDoc}
	 */
	public function getSubscriptionTypes() {
		return [];
	}


	/**
	 * {@inheritDoc}
	 */
	public function validateSubscription(ISubscription &$subscription) {
		throw new BackendUtils\SubscriptionInvalidException('Subscriptions not supported');
	}


	/**
	 * {@inheritDoc}
	 */
	public function getAvailablePrefixes() {
		return [];
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreColor() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreComponents() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreDescription() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreDisplayname() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreEnabled() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreOrder() {
		return false;
	}
}