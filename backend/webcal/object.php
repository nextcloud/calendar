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
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectCollection;
use OCA\Calendar\ISubscription;
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
	 * @var ISubscription
	 */
	private $subscription;


	/**
	 * @var ObjectFactory
	 */
	private $factory;


	/**
	 * @var IObjectCollection
	 */
	private $objects;


	/**
	 * @param BusinessLayer\Subscription $subscriptions
	 * @param IL10N $l10n
	 * @param ICacheFactory $cacheFactory
	 * @param ICalendar $calendar
	 * @param ObjectFactory $factory
	 * @throws BackendUtils\DoesNotExistException if no corresponding subscription was found
	 */
	public function __construct(BusinessLayer\Subscription $subscriptions, IL10N $l10n, ICacheFactory $cacheFactory,
								ICalendar $calendar, ObjectFactory $factory) {
		parent::__construct($subscriptions, $l10n, $cacheFactory);
		$this->calendar = $calendar;
		$this->factory = $factory;

		try {
			$calendar = $this->calendar;
			$this->subscription = $this->subscriptions->findByType(
				$calendar->getPrivateUri(), self::IDENTIFIER, $calendar->getUserId());
		} catch(BusinessLayer\Exception $ex) {
			throw new BackendUtils\DoesNotExistException($ex->getMessage());
		}
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
		if (!($this->objects instanceof IObjectCollection)) {
			$this->findAll();

			if (!($this->objects instanceof IObjectCollection)) {
				throw new BackendUtils\DoesNotExistException('Object not found');
			}
		}

		foreach($this->objects as $object) {
			/** @var IObject $object */
			if ($object->getUri() === $objectURI) {
				if ($object->getType() & $type) {
					return $object;
				} else {
					throw new BackendUtils\DoesNotExistException('Object exists, but is of wrong type');
				}
			}
		}

		throw new BackendUtils\DoesNotExistException('Object not found');
	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		if ($this->objects instanceof IObjectCollection) {
			return $this->objects->ofType($type);
		}

		$data = $this->getData($this->subscription);
		try {
			$this->objects = $this->factory->createCollectionFromData($data, ObjectFactory::FORMAT_ICAL);

			foreach ($this->objects as $object) {
				/** @var IObject $object */
				$object->setCalendar($this->calendar);
			}

			return $this->objects->ofType($type);
		} catch(ParseException $ex) {
			throw new CorruptDataException('CalendarManager-data is not valid!');
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($type=ObjectType::ALL) {
		if (!($this->objects instanceof IObjectCollection)) {
			$this->findAll();

			if (!($this->objects instanceof IObjectCollection)) {
				return [];
			}
		}

		return $this->objects->listAll($type);
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(IObject $object) {
		$newObject = $this->find($object->getUri());

		return ($newObject->getEtag(true) !== $object->getEtag(true));
	}
}