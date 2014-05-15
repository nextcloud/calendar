<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Backend\IBackend;

use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;

use \OCA\Calendar\Db\Mapper;
use \OCA\Calendar\Db\BackendMapper;

class BusinessLayer {

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
		$this->backends = BackendUtility::setup($mapper);
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
}