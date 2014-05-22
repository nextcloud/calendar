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

use OCP\Calendar\IBackendCollection;

use \OCP\AppFramework\IAppContainer;
use \OCA\Calendar\Backend\IBackend;
use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;
use \OCA\Calendar\Db\BackendMapper;
use \OCA\Calendar\Db\Mapper;
use \OCA\Calendar\Utility\BackendUtility;
use \OCA\Calendar\Utility\CalendarUtility;

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
	 * initialized backends
	 * @var \OCA\Calendar\Db\BackendCollection
	 */
	protected $backends;


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
	 * initialize calendar backend system
	 * @param BackendMapper $mapper
	 */
	public function initBackendSystem(BackendMapper $mapper) {
		$this->backends = BackendUtility::setup($this->app, $mapper);
	}


	/**
	 * @brief split up calendarURI
	 * @param string $calendarId e.g. local::personal
	 * @return array [$backend, $calendarURI]
	 * @throws BusinessLayerException if uri is empty
	 * @throws BusinessLayerException if uri is not valid
	 */
	public function splitCalendarURI($calendarId) {
		$split = CalendarUtility::splitURI($calendarId);

		if (!$split[0] || !$split[1]) {
			$msg = '"' . $calendarId . '" is not a valid calendarId';
			throw new BusinessLayerException($msg);
		}

		return $split;
	}


	/**
	 * @brief check if a backend does support a certian action
	 * @param string $backend
	 * @param integer $action
	 * @return boolean
	 */
	public function doesBackendSupport($backend, $action) {
		if (!($this->backends instanceof BackendCollection)) {
			return false;
		} else {
			$backend = $this->backends->search('backend', $backend)->current();
			if (!($backend instanceof Backend) || !($backend->api instanceof IBackend)) {
				return false;
			}
			return $backend->api->implementsActions($action);
		}
	}


	/**
	 * @brief throw exception if backend is not enabled
	 * @param string $backend
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function checkBackendEnabled($backend) {
		if (!($this->backends instanceof IBackendCollection)) {
			$msg = 'No backends set-up!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		if (!$this->backends->isEnabled($backend)) {
			$msg = 'Backend found but not enabled!';
			throw new BusinessLayerException($msg, Http::STATUS_BAD_REQUEST);
		}

		return true;
	}


	/**
	 * @brief throw exception if backend does not support action
	 * @param string $backend
	 * @param integer $action
	 * @return bool
	 * @throws BusinessLayerException
	 */
	public function checkBackendSupports($backend, $action) {
		if (!$this->doesBackendSupport($backend, $action)) {
			$msg = 'Backend does not support wanted action!';
			throw new BusinessLayerException($msg, HTTP::STATUS_BAD_REQUEST);
		}

		return true;
	}
}