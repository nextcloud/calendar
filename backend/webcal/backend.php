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
namespace OCA\Calendar\Backend\WebCal;

use Aws\Common\Exception\InvalidArgumentException;
use OCA\Calendar\Backend\SubscriptionInvalidException;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\IBackendAPI;
use OCA\Calendar\ISubscription;

class Backend extends WebCal implements IBackendAPI {

	/**
	 * returns whether or not a backend can be enabled
	 * @return boolean
	 */
	public function canBeEnabled() {
		return true;//function_exists('curl_init');
	}


	/**
	 * get information about supported subscription-types
	 * @return array
	 */
	public function getSubscriptionTypes() {
		return [
			[
				'name' => strval(\OC::$server->getL10N('calendar')->t('WebCal')),
				'type' => self::IDENTIFIER,
			],
		];
	}


	/**
	 * @param ISubscription $subscription
	 * @throws InvalidArgumentException
	 * @return bool
	 */
	public function validateSubscription(ISubscription &$subscription) {
		if ($subscription->getType() !== self::IDENTIFIER) {
			throw new InvalidArgumentException('Subscription-type not supported');
		}

		$this->validateSubscriptionUrl($subscription);
		$this->sendTestRequest($subscription);

		return true;
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


	/**
	 *
	 * @param ISubscription $subscription
	 * @throws SubscriptionInvalidException
	 */
	private function sendTestRequest(ISubscription &$subscription) {
		$curl = curl_init();
		$url = $subscription->getUrl();
		$data = null;

		$this->prepareRequest($curl, $url);
		$this->getRequestData($curl, $data);
		$this->validateRequest($curl);

		try {
			$vobject = Reader::read($data);

			//Is it an address-book instead of a calendar?
			if (!($vobject instanceof VCalendar)) {
				throw new ParseException();
			}
		} catch(ParseException $ex) {
			throw new SubscriptionInvalidException('CalendarManager-data is not valid!');
		}
	}
}