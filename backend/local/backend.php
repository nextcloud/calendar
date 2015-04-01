<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Bart Visscher
 * @copyright 2014 Bart Visscher <bartv@thisnet.nl>
 * @author Jakob Sack
 * @copyright 2014 Jakob Sack <mail@jakobsack.de>
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
namespace OCA\Calendar\Backend\Local;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\ISubscription;

class Backend implements BackendUtils\IBackendAPI {

	/**
	 * returns whether or not a backend can be enabled
	 * @return boolean
	 */
	public function canBeEnabled() {
		return true;
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
	 * @throws BackendUtils\SubscriptionInvalidException
	 * @return boolean
	 */
	public function validateSubscription(ISubscription &$subscription) {
		throw new BackendUtils\SubscriptionInvalidException('Subscription is not supported');
	}


	/**
	 * get translated string for createOn dialog
	 * @return array
	 */
	public function getAvailablePrefixes() {
		return [
			[
				'name' => strval(\OC::$server->getL10N('calendar')
					->t('this ownCloud')),
				'prefix' => '',
			],
		];
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
		return true;
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
		return true;
	}


	/**
	 * returns whether or not a backend can store if a calendar is enabled
	 * @return boolean
	 */
	public function canStoreEnabled() {
		return true;
	}


	/**
	 * returns whether or not a backend can store a calendar's order
	 * @return boolean
	 */
	public function canStoreOrder() {
		return true;
	}
}