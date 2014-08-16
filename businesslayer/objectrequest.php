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

use OCP\AppFramework\Http;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Utility\ObjectUtility;

class ObjectRequestBusinessLayer extends ObjectBusinessLayer {

	/**
	 * create an object from import
	 *
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
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
	 * @param \OCP\Calendar\IObjectCollection $collection
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function createCollection(IObjectCollection $collection) {
		$className = get_class($collection);

		/** @var IObjectCollection $createdObjects */
		$createdObjects = new $className();

		$collection->iterate(function(IObject &$object) use (&$createdObjects) {
			try {
				$object = $this->create($object);
			} catch(BusinessLayerException $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
				return true;
			}
			$createdObjects->add($object);
			return true;
		});

		return $createdObjects;
	}


	/**
	 * Updates an object from request
	 *
	 * @param \OCP\Calendar\IObject $object
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param string $uri UID of the object
	 * @param string $eTag
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function update(IObject $object, ICalendar &$calendar, $uri, $eTag) {
		$oldObject = $this->find($calendar, $uri);

		$this->checkETagsEqual($oldObject->getEtag(), $eTag);

		$oldObject->overwriteWith($object);
		$object = $oldObject;

		return parent::update($object, $calendar, $uri);
	}


	/**
	 * throw exception if eTags are not equal
	 *
	 * @param string $firstETag
	 * @param string $secondETag
	 * @return bool
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function checkETagsEqual($firstETag, $secondETag) {
		if ($firstETag !== $secondETag) {
			$msg = 'If-Match failed; eTags are not equal!';
			throw new BusinessLayerException($msg, Http::STATUS_PRECONDITION_FAILED);
		}

		return true;
	}
}