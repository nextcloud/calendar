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
use OCP\AppFramework\IAppContainer;
use OCP\Calendar\IEntity;
use OCA\Calendar\Db\Mapper;
use OCA\Calendar\Utility\CalendarUtility;

abstract class BusinessLayer {

	/**
	 * app container for dependency injection
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * ownCloud's core api
	 * @var \OCP\AppFramework\IApi
	 */
	protected $api;


	/**
	 * Mapper
	 * @var \OCA\Calendar\Db\Mapper
	 */
	protected $mapper;


	/**
	 * Constructor
	 * @param IAppContainer $app interface to the app
     * @param Mapper $mapper
	 */
	public function __construct(IAppContainer $app, Mapper $mapper){
		$this->app = $app;
		$this->api = $app->getCoreApi();
		$this->mapper = $mapper;
	}


	/**
	 * split up calendarURI
	 * @param string $calendarId e.g. local::personal
	 * @return array [$backend, $calendarURI]
	 * @throws BusinessLayerException if uri is empty
	 * @throws BusinessLayerException if uri is not valid
	 */
	protected function splitCalendarURI($calendarId) {
		$split = CalendarUtility::splitURI($calendarId);

		if (!$split[0] || !$split[1]) {
			$msg = '"' . $calendarId . '" is not a valid calendarId';
			throw new BusinessLayerException($msg);
		}

		return $split;
	}


	/**
	 * throw exception if entity is not valid
	 * @param IEntity $entity
	 * @return bool
	 * @throws BusinessLayerException
	 */
	protected function checkIsValid(IEntity $entity) {
		if (!$entity->isValid()) {
			$msg = $this->getClassName($entity) . ' instance is not valid';
			throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		return true;
	}


	/**
	 * @param string $p1
	 * @param string $p2
	 * @return bool
	 * @throws BusinessLayerException
	 */
	protected function checkDoesNotExist($p1, $p2) {
		if (method_exists($this, 'doesExist')) {
			if ($this->doesExist($p1, $p2)) {
				$msg = 'Already exists!';
				throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
			}
		}

		return true;
	}


	/**
	 * compare two userIds and throw exception if not equal
	 * @param string $user1
	 * @param string $user2
	 * @return bool
	 * @throws BusinessLayerException
	 */
	protected function checkUsersEqual($user1, $user2) {
		if ($user1 !== $user2) {
			$msg = 'Transferring a calendar to another user is not supported yet.';
			throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		return true;
	}


	/**
	 * @param IEntity $entity
	 * @return string
	 */
	private function getClassName(IEntity $entity) {
		$class = get_class($entity);
		return substr($class, strrpos( $class, '\\' ) + 1);
	}
}