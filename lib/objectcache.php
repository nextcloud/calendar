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
namespace OCA\Calendar;

use OCP\Calendar\IObjectAPI;
use OCP\Calendar\ICalendar;

use OCA\Calendar\Db\ObjectMapper;

class ObjectCache {

	/**
	 * @var IObjectAPI
	 */
	protected $objectAPI;


	/**
	 * @var ObjectMapper
	 */
	protected $objectCache;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->objectAPI = $calendar->getBackend()
			->getObjectAPI($calendar);
		$this->objectCache = $calendar->getBackend()
			->getObjectCache($calendar);
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * Limit and Offset does not apply to deleting objects
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 * @throws Backend\Exception
	 */
	public function scan($limit=null, $offset=null) {
		try {
			$remote = $this->objectAPI->listAll();
		} catch(Backend\TemporarilyNotAvailableException $ex) {
			//Skip for now
			return;
		} catch(Backend\Exception $ex) {
			//TODO - what to do?
			throw $ex;
		}
		$cached = $this->objectCache->listAll();

		sort($remote);
		sort($cached);

		$toDelete = array_diff($cached, $remote);
		$this->removeListFromCache($toDelete);

		if ($limit !== null && $offset === null) {
			$offset = 0;
		}

		$i = 0;
		foreach ($remote as $r) {
			if ($i++ < $offset) {
				continue;
			}
			if ($limit > ($offset - $i)) {
				break;
			}

			if (in_array($r, $cached)) {
				$this->updateCache($r);
			} else {
				$this->addToCache($r);
			}
		}
	}


	/**
	 * @param string $objectUri
	 */
	protected function addToCache($objectUri) {
		//TODO catch exceptions
		$remote = $this->objectAPI->find($objectUri);

		$this->objectCache->insert($remote);
	}


	/**
	 * @param string $objectUri
	 */
	protected function updateCache($objectUri) {
		//TODO catch exceptions
		try {
			$remote = $this->objectAPI->find($objectUri);
		} catch(Backend\Exception $ex) {
			//Skip element
			return;
		}
		$cached = $this->objectCache->find($objectUri);

		if ($remote->getEtag(true) === $cached->getEtag(true)) {
			return;
		}

		$this->objectCache->update($remote);
	}


	/**
	 * delete object based on objectUri from cache
	 * @param string $objectUri
	 */
	protected function removeFromCache($objectUri) {
		$this->removeListFromCache([$objectUri]);
	}


	/**
	 * delete multiple objects based on array of
	 * objectUris from cache
	 * @param array $objectUris
	 */
	protected function removeListFromCache(array $objectUris=[]) {
		$this->objectCache->deleteList($objectUris);
	}
}