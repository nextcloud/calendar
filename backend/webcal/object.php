<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Maxime Corteel
 * @copyright 2014 Maxime Corteel <mcorteel@gmail.com>
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
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCP\ICacheFactory;
use OCP\IL10N;
use Sabre\VObject\ParseException;

use OCA\Calendar\Db\ObjectType;

class Object extends WebCal implements BackendUtils\IObjectAPI {

	/**
	 * @var ICalendar
	 */
	private $calendar;


	/**
	 * @var ObjectFactory
	 */
	private $factory;


	/**
	 * @param BusinessLayer\Subscription $subscriptions
	 * @param IL10N $l10n
	 * @param ICacheFactory $cacheFactory
	 * @param ICalendar $calendar
	 * @param ObjectFactory $factory
	 */
	public function __construct(BusinessLayer\Subscription $subscriptions, IL10N $l10n, ICacheFactory $cacheFactory,
								ICalendar $calendar, ObjectFactory $factory) {
		parent::__construct($subscriptions, $l10n, $cacheFactory);
		$this->calendar = $calendar;
		$this->factory = $factory;
	}


	/**
	 * {@inheritDoc}
	 */
	public function cache() {
		return true;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($objectURI, $type=ObjectType::ALL) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		try {
			$calendar = $this->calendar;
			$subscription = $this->subscriptions->findByType(
				$calendar->getPrivateUri(), self::IDENTIFIER, $calendar->getUserId());
		} catch(BusinessLayer\Exception $ex) {
			throw new BackendUtils\DoesNotExistException($ex->getMessage());
		}

		$curl = curl_init();
		$url = $subscription->getUrl();
		$data = null;

		$this->prepareRequest($curl, $url);
		$this->getRequestData($curl, $data);
		$this->validateRequest($curl);

		$objectCollection = new ObjectCollection();

		try {
			//TODO - use Factory
			/*$splitter = new ICalendarSplitter($data);
			while($vobject = $splitter->getNext()) {
				$object = new Object();
				$object->fromVObject($vobject);
				$objectCollection->add($object);
			}*/
		} catch(ParseException $ex) {
			throw new CorruptDataException('CalendarManager-data is not valid!');
		}
		return $objectCollection;
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($type=ObjectType::ALL) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(IObject $object) {

	}
}