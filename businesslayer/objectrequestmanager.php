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
namespace OCA\Calendar\BusinessLayer;

use OCA\Calendar\CorruptDataException;
use OCP\AppFramework\Http;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectCollection;

use OCA\Calendar\Utility\ObjectUtility;

class ObjectRequestManager extends ObjectManager {

	/**
	 * create an object from import
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function create(IObject &$object) {
		if($object->getUri() === null) {
			$randomURI = ObjectUtility::randomURI();
			$object->setUri($randomURI);
		}

		/*
		 * generate an provisional etag
		 * backends can overwrite it if necessary
		 */
		$object->getEtag(true);

		return parent::create($object);
	}


	/**
	 * Creates new objects from import
	 *
	 * @param \OCA\Calendar\IObjectCollection $collection
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObjectCollection
	 */
	public function createCollection(IObjectCollection $collection) {
		$className = get_class($collection);

		/** @var IObjectCollection $createdObjects */
		$createdObjects = new $className();

		foreach($collection as $object) {
			try {
				$object = $this->create($object);
			} catch(Exception $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
			} catch(CorruptDataException $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
			}
			$createdObjects[] = $object;
		}

		return $createdObjects;
	}


	/**
	 * Updates an object from request
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @param string $eTag
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function update(IObject $object, $eTag) {
		$oldObject = $this->find($object->getUri());

		$this->checkETagsEqual($oldObject->getEtag(), $eTag);

		$oldObject->overwriteWith($object);
		$object = $oldObject;

		return parent::update($object);
	}


	/**
	 * throw exception if eTags are not equal
	 *
	 * @param string $firstETag
	 * @param string $secondETag
	 * @return bool
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 */
	private function checkETagsEqual($firstETag, $secondETag) {
		if ($firstETag !== $secondETag) {
			$msg = 'If-Match failed; eTags are not equal!';
			throw new Exception($msg, Http::STATUS_PRECONDITION_FAILED);
		}

		return true;
	}
}