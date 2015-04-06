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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectCollection;
use OCA\Calendar\Utility\ObjectUtility;

use OCP\AppFramework\Http;
use OCP\Util;

class ObjectRequestManager extends ObjectManager {

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

		$this->checkCalendarSupports(Permissions::CREATE);
		if (!($this->api instanceof BackendUtils\IObjectAPICreate)) {
			throw new Exception('Backend does not support creating objects');
		}

		foreach($collection as $object) {
			try {
				if($object->getUri() === null) {
					$randomURI = ObjectUtility::randomURI();
					$object->setUri($randomURI);
				}

				$object->setCalendar($this->calendar);
				$object->getEtag(true);

				$this->checkObjectIsValid($object);

				Util::emitHook('\OCA\Calendar', 'preCreateObject',
					array($object));

				$object = $this->api->create($object);

				Util::emitHook('\OCA\Calendar', 'postCreateObject',
					array($object));

				$createdObjects[] = $object;
			} catch (BackendUtils\Exception $ex) {
				$this->logger->debug($ex->getMessage());
			} catch(Exception $ex) {
				$this->logger->debug($ex->getMessage());
			} catch(CorruptDataException $ex) {
				$this->logger->debug($ex->getMessage());
			}
		}

		if ($this->isCachingEnabled) {
			$this->calendar->checkUpdate();
		}

		return $createdObjects;
	}


	/**
	 * Updates an object from request
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @param string $etag
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function update(IObject $object, $etag) {
		$oldObject = $this->find($object->getUri());

		$this->checkETagsEqual($oldObject->getEtag(), $etag);

		$oldObject->overwriteWith($object);
		$object = $oldObject;

		return parent::update($object);
	}


	/**
	 * throw exception if eTags are not equal
	 *
	 * @param string $firstEtag
	 * @param string $secondEtag
	 * @return bool
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 */
	private function checkETagsEqual($firstEtag, $secondEtag) {
		if ($firstEtag !== $secondEtag) {
			$msg = 'If-Match failed; eTags are not equal!';
			throw new Exception($msg, Http::STATUS_PRECONDITION_FAILED);
		}

		return true;
	}
}