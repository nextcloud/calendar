<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;
use \OCA\Calendar\Db\BackendMapper;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\CalendarUtility;
use \OCA\Calendar\Utility\ObjectUtility;

class BackendDependedBusinessLayer extends BusinessLayer {

	/**
	 * backendBusinessLayer object
	 * @var \OCA\Calendar\BusinessLayer\BackendBusinessLayer
	 */
	protected $bbl;


	/**
	 * Backend Collection
	 * @var \OCA\Calendar\Db\BackendCollection
	 */
	protected $backends;


	/**
	 * Constructor
	 * @param IAppContainer $app interface to the app
	 * @param BackendBusinessLayer $backendBusinessLayer
	 */
	public function __construct(IAppContainer $app, 
								BackendBusinessLayer $backendBusinessLayer){
		parent::__construct($app);
		$this->bbl = $backendBusinessLayer;
		$this->backends = $this->bbl->setup();
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

		if ($split[0] === false || $split[1] === false) {
			$msg  = 'BackendDependedBusinessLayer::splitCalendarURI(): User Error: ';
			$msg .= 'Given calendarId is not valid!';
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
		return $this->backends->search('backend', $backend)->current()->api->implementsActions($action);
	}
}