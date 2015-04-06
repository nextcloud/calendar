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

use OCA\Calendar\CorruptDataException;
use OCP\ILogger;

class ObjectFactory extends EntityFactory {


	/**
	 * use if data is in ical format
	 */
	const FORMAT_ICAL = 3;


	/**
	 * use if data is in jcal format
	 */
	const FORMAT_JCAL = 4;


	/**
	 * use if data is an vobject
	 */
	const FORMAT_VObject = 5;


	/**
	 * @var ILogger
	 */
	protected $logger;


	/**
	 * @var \closure
	 */
	protected $iCal;


	/**
	 * @var \closure
	 */
	protected $jCal;


	/**
	 * @param ILogger $logger
	 * @param \closure $iCal
	 * @param \closure $jCal
	 */
	public function __construct(ILogger $logger, \closure $iCal, \closure $jCal) {
		$this->logger = $logger;
		$this->iCal = $iCal;
		$this->jCal = $jCal;
	}


	/**
	 * @param mixed $data
	 * @param int $format
	 * @return \OCA\Calendar\Db\Object
	 * @throws CorruptDataException
	 */
	public function createEntity($data, $format=self::FORMAT_PARAM) {
		switch ($format) {
			case self::FORMAT_PARAM:
				return Object::fromParams($data);
				break;

			case self::FORMAT_ROW:
				return Object::fromRow($data);
				break;

			case self::FORMAT_ICAL:
			case self::FORMAT_JCAL:
				return $this->parseRawCal($data, $format, true);
				break;

			case self::FORMAT_VObject:
				return Object::fromVObject($data);
				break;

			default:
				throw new \InvalidArgumentException('ObjectFactory::createEntity() - Unknown format given');
				break;

		}
	}

	/**
	 * @param \OCA\Calendar\Db\Object[] $entities
	 * @return ObjectCollection
	 */
	public function createCollectionFromEntities(array $entities) {
		return ObjectCollection::fromArray($entities);
	}


	/**
	 * @param mixed $data
	 * @param integer $format
	 * @return ObjectCollection
	 */
	public function createCollectionFromData($data, $format) {
		$collection = new ObjectCollection();

		if ($format === self::FORMAT_ICAL || $format === self::FORMAT_JCAL) {
			return $this->parseRawCal($data, $format, false);
		}

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


	/**
	 * @param $data
	 * @param $format
	 * @param boolean $isEntity whether to return entity or collection
	 * @return \OCA\Calendar\Db\Object
	 */
	private function parseRawCal($data, $format, $isEntity) {
		//TODO - catch parseException
		if ($format === self::FORMAT_ICAL) {
			//fix malformed timestamp in some google calendar events
			//originally contributed by github.com/nezzi
			//$data = str_replace('CREATED:00001231T000000Z', 'CREATED:19700101T000000Z', $data);

			$splitter = call_user_func_array($this->iCal, [$data]);
		} else {
			$splitter = call_user_func_array($this->jCal, [$data]);
		}

		/** @var \Sabre\VObject\Splitter\SplitterInterface $splitter */
		$firstEntity = $splitter->getNext();
		if (!$firstEntity) {
			throw new \InvalidArgumentException('ObjectFactory::parseRawCal() - Data doesn\'t contain any object');
		}

		if ($isEntity) {
			return $this->createEntity($firstEntity, self::FORMAT_VObject);
		}

		$entities = [
			$firstEntity,
		];

		while($next = $splitter->getNext()) {
			$entities[] = $next;
		}

		return $this->createCollectionFromData($entities, self::FORMAT_VObject);
	}
}