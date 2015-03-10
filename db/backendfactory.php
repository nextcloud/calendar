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

class BackendFactory {

	/**
	 * @var callable
	 */
	private $defaultObjectCache;

	/**
	 * @var callable
	 */
	private $defaultObjectScanner;

	/**
	 * @var callable
	 */
	private $defaultObjectWatcher;


	/**
	 * @param callable $objectCache
	 * @param callable $objectScanner
	 * @param callable $objectWatcher
	 */
	public function __construct(callable $objectCache, callable $objectScanner,
								callable $objectWatcher) {
		$this->defaultObjectCache = $objectCache;
		$this->defaultObjectScanner = $objectScanner;
		$this->defaultObjectWatcher = $objectWatcher;
	}


	/**
	 * @param $id
	 * @param callable $backendAPI
	 * @param callable $calendarAPI
	 * @param callable $objectAPI
	 * @param callable $objectCache
	 * @param callable $objectScanner
	 * @param callable $objectWatcher
	 *
	 * @return Backend
	 */
	public function createBackend($id, callable $backendAPI, callable $calendarAPI, callable $objectAPI,
								  callable $objectCache = null, callable $objectScanner = null,
								  callable $objectWatcher = null) {
		$backend = new Backend();
		$backend->setId($id);
		$backend->setBackendAPI($backendAPI);
		$backend->setCalendarAPI($calendarAPI);
		$backend->setObjectAPI($objectAPI);

		$backend->setObjectcache(($objectCache) ? $objectCache : $this->defaultObjectCache);
		$backend->setObjectScanner(($objectScanner) ? $objectScanner : $this->defaultObjectScanner);
		$backend->setObjectWatcher(($objectWatcher) ? $objectWatcher : $this->defaultObjectWatcher);

		return $backend;
	}
}