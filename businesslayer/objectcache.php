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

use OCP\Calendar\ICalendar;

class ObjectCacheBusinessLayer extends BusinessLayer {

	/**
	 * @brief update list of outdated objects for a calendar
	 * @param ICalendar $calendar
	 */
	public function updateObjectList(ICalendar $calendar) {
		//$cached = $this->mapper->getUriETagList($calendar);
		$remote = $this->backends->find($calendar->getBackend())->api->findCalendars(null, null, null);

		$updatedOnRemote = $this->analyzeForOutDatedObjects($cached, $remote);
		$deletedOnRemote = $this->analyzeForDeletedObjects($cached, $remote);
		$createdOnRemote = $this->analyzeForCreatedObjects($cached, $remote);
	}


	/**
	 * @brief get list of outdated objects in a calendar
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @brief array
	 */
	public function getOutDatedObjectsInCalendar(ICalendar $calendar, $limit, $offset) {

	}


	/**
	 * @brief get list of objects not cached
	 * @param ICalendar $calendar
	 * @param $limit
	 * @param $offset
	 * @brief array
	 */
	public function getObjectsNotCached(ICalendar $calendar, $limit, $offset) {

	}


	/**
	 * @brief find all objects created on remote
	 * @param array $cached
	 * @param array $remote
	 * @return array
	 */
	private function analyzeForCreatedObjects(array $cached, array $remote) {
		return array_diff_key($cached, $remote);
	}


	/**
	 * @brief find all objects deleted on remote
	 * @param array $cached
	 * @param array $remote
	 * @return array
	 */
	private function analyzeForDeletedObjects(array $cached, array $remote) {
		return array_diff_key($remote, $cached);
	}


	/**
	 * @brief find all objects updated on remote
	 * @param array $cached
	 * @param array $remote
	 * @return array
	 */
	private function analyzeForOutDatedObjects(array $cached, array $remote) {
		return array_intersect($cached, $remote, array_diff_assoc($cached, $remote));
	}
}

?>




/**
* updates cache manager for a certian calendar
* @param Calendar $calendar
* @return boolean
*/
public function updateCacheManagerFromRemote(Calendar $calendar/*, $limit, $offset*/) {
$backend = $calendar->getBackend();
$calendarURI = $calendar->getUri();
$userId = $calendar->getUserId();

$api = &$this->backends->find($backend)->api;
if (!$api->cacheObjects($calendarURI, $userId)) {
return true;
}

$cachedEtags = $this->mapper->getUriToEtagMap($calendar, $limit, $offset);
$remoteEtags = $api->getUriToEtagMap($calendar, $limit, $offset);

$deletedObjects = array_diff_key($remoteEtags, $cachedEtags);
$createdObjects = array_diff_key($cachedEtags, $remoteEtags);

$this->ocm->setDeleted($calendar, $deletedObjects);
$this->ocm->setCreated($calendar, $createdObjects);

$otherCachedObjects = array_intersect_assoc(
$cachedEtags,
array_merge($deletedObjects, $createdObjects)
);

$otherRemoteObjects = array_intersect_assoc(
$remoteEtags,
array_merge($deletedObjects, $createdObjects)
);

$updatedObjects = array_diff_assoc($otherCachedObjects, $otherRemoteObjects);

$this->ocm->setOutDated($calendar, $updatedObjects);

return true;
}


/**
* create objects marked as created in cache manager
* @param Calendar $calendar
* @param integer $limit
* @param integer $offset
* @return boolean
*/
public function updateCacheFromCacheManagerCreate(Calendar $calendar, $limit, $offset) {
$backend = $calendar->getBackend();
$calendarURI = $calendar->getUri();
$userId = $calendar->getUserId();

$api = &$this->backends->find($backend)->api;
$createdObjects = $this->ocm->getCreated($calendar, $limit, $offset);

foreach($createdObjects as $objectURI) {
try {
if($this->doesObjectExist($calendar, $objectURI)) {
$object = $api->findObject($calendar, $objectURI);
if($object->isValid()) {
$this->mapper->insert($object);
}
}
} catch(/* some */Exception $ex) {}
$this->ocm->deleteCreated($calendar, $objectURI);
}

return true;
}


/**
* delete objects marked as deleted in cache manager
* @param Calendar $calendar
* @param integer $limit
* @param integer $offset
* @return boolean
*/
public function updateCacheFromCacheManagerDelete(Calendar $calendar, $limit, $offset) {
$backend = $calendar->getBackend();
$calendarURI = $calendar->getUri();
$userId = $calendar->getUserId();

$api = &$this->backends->find($backend)->api;
$deletedObjects = $this->ocm->getDeleted($calendar, $limit, $offset);

foreach($deletedObjects as $objectURI) {
try {
if($api->doesObjectExist($calendar, $objectURI)) {
$this->ocm->setOneCreated($calendar, $objectURI);
} else {
$object = $this->findObject($calendar, $objectURI);
$this->mapper->delete($object);
}
} catch(/* some */Exception $ex) {}
$this->ocm->deleteDeleted($calendar, $objectURI);
}

return true;
}


/**
* updates objects marked as outdated in cache manager
* @param Calendar $calendar
* @param integer $limit
* @param integer $offset
* @return boolean
*/
public function updateCacheFromCacheManagerUpdate(Calendar $calendar, $limit, $offset) {
$backend = $calendar->getBackend();
$calendarURI = $calendar->getUri();
$userId = $calendar->getUserId();

$api = &$this->backends->find($backend)->api;
$updatedObjects = $this->ocm->getOutDated($calendar, $limit, $offset);

foreach($updatedObjects as $objectURI) {
try {
if($api->doesObjectExist($calendar, $objectURI)) {
$object = $api->findObject($calendar, $objectURI);
if($object->isValid()) {
$this->mapper->update($object);
}
} else {
$this->ocm->setOneDeleted($calendar, $objectURI);
}
} catch(/* some */Exception $ex) {}
$this->ocm->deleteUpdated($calendar, $objectURI);
}

return true;
}