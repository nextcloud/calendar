<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Http;

use OCA\Calendar\IEntity;
use OCA\Calendar\ICollection;

abstract class SimpleJSONReader extends JSONReader {

	/**
	 * classname for entities
	 * @var string
	 */
	protected $entityName;


	/**
	 * classname for collections
	 * set to null if collections are not supported
	 * @var null|string
	 */
	protected $collectionName=null;


	/**
	 * @param resource $handle
	 * @param string $entityName
	 * @param string $collectionName defaults to null
	 */
	public function __construct($handle, $entityName, $collectionName=null) {
		parent::__construct($handle);

		$this->entityName = $entityName;
		$this->collectionName = $collectionName;
	}


	/**
	 * parse input data
	 * @return $this
	 * @throws ReaderException
	 */
	public function parse() {
		if ($this->isUserDataACollection()) {
			$object = $this->parseCollection();
		} else {
			$object = $this->parseSingleEntity();
		}

		$this->setObject($object);
	}


	/**
	 * check if $this->data is a collection
	 * @return boolean
	 */
	protected function isUserDataACollection() {
		if (array_key_exists(0, $this->json) && is_array($this->json[0])) {
			return true;
		}

		return false;
	}


	/**
	 * parse a collection
	 * @throws ReaderException
	 * @return ICollection
	 */
	protected function parseCollection() {
		if ($this->collectionName === null) {
			throw new ReaderException(
				'Collections are not supported'
			);
		}

		if (!class_exists($this->collectionName)) {
			throw new ReaderException(
				'Registered collection-class does not exist'
			);
		}

		$collection = new $this->collectionName();
		if (!($collection instanceof ICollection)) {
			throw new ReaderException(
				'Registered collection-class does not implement ICollection'
			);
		}


		foreach($this->json as $singleJSON) {
			try {
				$entity = $this->parseSingleEntity($singleJSON);
				$collection[] = $entity;
			} catch(SerializerException $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
				continue;
			}
		}

		return $collection;
	}


	/**
	 * parse a single entity
	 * @param array $json
	 * @throws ReaderException
	 * @return IEntity
	 */
	protected function parseSingleEntity($json=null) {
		if ($json === null) {
			$json = $this->json;
		}

		if (!class_exists($this->entityName)) {
			throw new ReaderException(
				'Registered entity-class does not exist'
			);
		}

		$entity = new $this->entityName();
		if (!($entity instanceof IEntity)) {
			throw new ReaderException(
				'Registered entity-class does not implement IEntity'
			);
		}

		foreach($json as $key => $value) {
			$this->setProperty($entity, $key, $value);
		}

		return $entity;
	}


	/**
	 * set property in entity based on key-value pair from input data
	 * @param IEntity &$entity
	 * @param string $key
	 * @param mixed $value
	 */
	abstract protected function setProperty(IEntity &$entity, $key, $value);
}