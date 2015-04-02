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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\BusinessLayer;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\ICalendar;
use OCP\ICacheFactory;
use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\ParseException;
use Sabre\VObject\Reader;

use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\ISubscription;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCP\IL10N;

class Calendar extends WebCal implements BackendUtils\ICalendarAPI, BackendUtils\ICalendarAPIDelete {

	/**
	 * @var IBackend
	 */
	private $backend;


	/**
	 * @var CalendarFactory
	 */
	private $factory;


	/**
	 * @param BusinessLayer\Subscription $subscriptions
	 * @param IL10N $l10n
	 * @param ICacheFactory $cacheFactory
	 * @param IBackend $backend
	 * @param CalendarFactory $calendarFactory
	 */
	public function __construct(BusinessLayer\Subscription $subscriptions, IL10N $l10n, ICacheFactory $cacheFactory,
								IBackend $backend, CalendarFactory $calendarFactory) {
		parent::__construct(BusinessLayer\$subscriptions, $l10n, $cacheFactory);
		$this->backend = $backend;
		$this->factory = $calendarFactory;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($privateUri, $userId) {
		$subscription = $this->subscriptions->find($privateUri, $userId);

		return $this->generateCalendar($subscription);
	}


	/**
	 * {@inheritDoc}
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
			} catch (BackendUtils\Exception $ex) {
				return;
			}
		});

		return $calendars;
	}


	/**
	 * {@inheritDoc}
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
	 * {@inheritDoc}
	 */
	public function hasUpdated(ICalendar $calendar) {
		//TODO - what do we want to use for ctag anyway
		return false;
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
			throw new CorruptDataException('Calendar-data is not valid!');
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
	 * {@inheritDoc}
	 */
	public function delete($privateUri, $userId) {
		try {
			$subscription = $this->subscriptions->find($privateUri, $userId);
			return $this->subscriptions->delete($subscription);
		} catch(BusinessLayer\Exception $ex) {
			throw new BackendUtils\Exception($ex);
		}
	}
}