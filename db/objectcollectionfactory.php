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

class ObjectCollectionFactory extends CollectionFactory {

	/**
	 * @var ObjectFactory
	 */
	protected $entityFactory;


	/**
	 * @var ILogger
	 */
	protected $logger;


	/**
	 * @param ObjectFactory $entityFactory
	 * @param ILogger $logger
	 */
	public function __construct(ObjectFactory $entityFactory, ILogger $logger) {
		$this->entityFactory = $entityFactory;
		$this->logger = $logger;
	}


	/**
	 * @param Object[] $entities
	 * @return ObjectCollection
	 */
	public function createFromEntities(array $entities) {
		return ObjectCollection::fromArray($entities);
	}


	/**
	 * @param array $data
	 * @param integer $format
	 * @return ObjectCollection
	 */
	public function createFromData(array $data, $format) {
		$collection = new ObjectCollection();

		foreach($data as $item) {
			try {
				$entity = $this->entityFactory->createEntity($item, $format);
				$collection->add($entity);
			} catch(CorruptDataException $ex) {
				$this->logger->info($ex->getMessage());
				continue;
			}
		}

		return $collection;
	}
}