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

use OCA\Calendar\Backend\Exception;
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Backend\Exception as BackendException;
use OCP\AppFramework\Db\DoesNotExistException;

use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarAPI;
use OCA\Calendar\ICalendarAPIDelete;
use OCA\Calendar\ICalendarCollection;
use OCA\Calendar\ISubscription;
use OCA\Calendar\ObjectType;
use OCA\Calendar\Permissions;

class Calendar extends WebCal implements ICalendarAPI, ICalendarAPIDelete {

	/**
	 * @var IBackend
	 */
	private $backend;


	/**
	 * @param SubscriptionBusinessLayer $subscriptions
	 * @param IBackend $backend
	 */
	public function __construct(SubscriptionBusinessLayer $subscriptions,
								IBackend $backend) {
		parent::__construct($subscriptions);
		$this->backend = $backend;
	}


	/**
	 * returns information about calendar $privateUri of the user $userId
	 * @param string $privateUri
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function find($privateUri, $userId) {
		$subscription = $this->subscriptions->find($privateUri, $userId);

		return $this->generateCalendar($subscription);
	}


	/**
	 * returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$subscriptions = $this->subscriptions->findAllByType(
			$userId,
			self::IDENTIFIER,
			$limit,
			$offset
		);

		$calendars = new CalendarCollection();
		$subscriptions->iterate(function(ISubscription $subscription) use (&$calendars, $userId) {
			try {
				$calendar = $this->generateCalendar($subscription);
				$calendars->add($calendar);
			} catch (CorruptDataException $ex) {
				return;
			} catch (BackendException $ex) {
				return;
			}
		});

		return $calendars;
	}


	/**
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		$uriList = array();

		$subscriptions = $this->subscriptions->findAllByType($userId, self::IDENTIFIER, null, null);
		$subscriptions->iterate(function(ISubscription $subscription) use (&$uriList) {
			$uriList[] = strval($subscription->getId());
		});

		return $uriList;
	}


	/**
	 * @param ISubscription $subscription
	 * @return \OCA\Calendar\IEntity
	 * @throws CorruptDataException
	 */
	private function generateCalendar(ISubscription $subscription) {
		$curl = curl_init();
		$url = $subscription->getUrl();
		$data = null;

		$this->prepareRequest($curl, $url);
		$this->getRequestData($curl, $data);
		$this->validateRequest($curl);
		$this->stripOfObjectData($data);

		try {
			$vobject = Reader::read($data);

			//Is it an address-book instead of a calendar?
			if (!($vobject instanceof VCalendar)) {
				throw new ParseException();
			}

			$calendar = new \OCA\Calendar\Db\Calendar();
			$calendar->fromVObject($vobject);
		} catch(ParseException $ex) {
			throw new CorruptDataException('CalendarManager-data is not valid!');
		}

		$calendar->setUserId($subscription->getUserId());
		$calendar->setOwnerId($subscription->getUserId());
		$calendar->setBackend($this->backend);
		$calendar->setPrivateUri($subscription->getId());
		$calendar->setComponents(ObjectType::EVENT);
		$calendar->setEnabled(true);
		$calendar->setCruds(Permissions::READ);
		$calendar->setOrder(0);
		//TODO - use something better for ctag
		$calendar->setCtag(time());

		return $calendar;
	}


	/**
	 * @param string $privateUri
	 * @param string $userId
	 * @throws Exception
	 * @return boolean
	 */
	public function delete($privateUri, $userId) {
		try {
			$subscription = $this->subscriptions->find($privateUri, $userId);
			return $this->subscriptions->delete($subscription);
		} catch(BusinessLayerException $ex) {
			throw new Exception($ex);
		}
	}
}