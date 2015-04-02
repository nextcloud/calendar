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
namespace OCA\Calendar\Db;

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Backend\TemporarilyNotAvailableException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarCollection;

use OCP\ILogger;

class CalendarFactory extends EntityFactory {

	/**
	 * @var \OCA\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	protected $timezones;


	/**
	 * @var ILogger
	 */
	protected $logger;


	/**
	 * @param IBackendCollection $backends
	 * @param TimezoneMapper $timezones
	 * @param ILogger $logger
	 */
	function __construct(IBackendCollection $backends, TimezoneMapper $timezones, ILogger $logger) {
		$this->backends = $backends;
		$this->timezones = $timezones;
		$this->logger = $logger;
	}


	/**
	 * @param mixed $data
	 * @param int $format
	 * @return \OCA\Calendar\Db\Calendar
	 * @throws CorruptDataException
	 * @throws TemporarilyNotAvailableException
	 * @throws \InvalidArgumentException
	 */
	public function createEntity($data, $format=self::FORMAT_PARAM) {
		if (!is_array($data) || empty($data)) {
			throw new CorruptDataException('CalendarFactory::createEntity() - Calendardata is empty');
		}

		if (isset($data['backend'])) {
			if ($data['backend'] instanceof IBackend) {
				if (!$this->backends->inCollection($data['backend'])) {
					unset($data['backend']);
				}
			} else {
				$backend = $this->backends->find($data['backend']);
				if (!($backend instanceof IBackend)) {
					throw new TemporarilyNotAvailableException(
						'CalendarFactory::createEntity() - Calendardata references unknown backend'
					);
				}

				//replace backend-identifier with IBackend instance
				$data['backend'] = $backend;
			}
		}

		//replace timezone-identifier with ITimezone instance
		if (isset($data['timezone']) && isset($data['user_id'])) {
			try {
				$timezone = $this->timezones->find($data['timezone'], $data['user_id']);
				$row['timezone'] = $timezone;
			} catch (DoesNotExistException $ex) {
				unset($data['timezone']);
			}
		}

		//TODO - fix me
		unset($data['last_properties_update']);
		unset($data['last_object_update']);

		switch ($format) {
			case self::FORMAT_PARAM:
				return Calendar::fromParams($data);
				break;

			case self::FORMAT_ROW:
				return Calendar::fromRow($data);
				break;

			default:
				throw new \InvalidArgumentException('CalendarFactory::createEntity() - Unknown format given');
				break;
		}
	}


	/**
	 * @param ICalendar[] $entities
	 * @return ICalendarCollection
	 */
	public function createCollectionFromEntities(array $entities) {
		return CalendarCollection::fromArray($entities);
	}


	/**
	 * @param array $data
	 * @param integer $format
	 * @return ICalendarCollection
	 */
	public function createCollectionFromData(array $data, $format) {
		$collection = new CalendarCollection();

		foreach($data as $item) {
			try {
				$entity = $this->createEntity($item, $format);
				$collection->add($entity);
			} catch(CorruptDataException $ex) {
				$this->logger->info($ex->getMessage());
				continue;
			}
		}

		return $collection;
	}
}