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
namespace OCP\Calendar;

interface IBackendAPI {

	/**
	 * returns whether or not a backend can be enabled
	 *
	 * This method returns a boolean.
	 * This method is mandatory!
	 */
	public function canBeEnabled();


	/**
	 * returns list of available uri prefixes
	 *
	 * @return array
	 */
	public function getAvailablePrefixes();


	/**
	 * returns list of subscription types supported by backend
	 *
	 * @return array
	 */
	public function getSubscriptionTypes();


	/**
	 * @param ISubscription $subscription
	 * @throws \OCA\Calendar\Backend\Exception
	 * @return bool
	 */
	public function validateSubscription(ISubscription &$subscription);


	/**
	 * returns whether or not a backend can store a calendar's color
	 *
	 * This method returns a boolean
	 * This method is mandatory!
	 * @return boolean
	 */
	public function canStoreColor();


	/**
	 * returns whether or not a backend can store a calendar's supported components
	 *
	 * This method returns a boolean
	 * This method is mandatory!
	 * @return boolean
	 */
	public function canStoreComponents();


	/**
	 * returns whether or not a backend can store a calendar's description
	 *
	 * @return boolean
	 */
	public function canStoreDescription();


	/**
	 * returns whether or not a backend can store a calendar's displayname
	 *
	 * This method returns a boolean
	 * This method is mandatory!
	 * @return boolean
	 */
	public function canStoreDisplayname();


	/**
	 * returns whether or not a backend can store if a calendar is enabled
	 *
	 * This method returns a boolean
	 * This method is mandatory!
	 * @return boolean
	 */
	public function canStoreEnabled();


	/**
	 * returns whether or not a backend can store a calendar's order
	 *
	 * This method returns a boolean
	 * This method is mandatory!
	 * @return boolean
	 */
	public function canStoreOrder();
}