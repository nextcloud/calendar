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
	 * Constructor
	 * @param IAppContainer $app interface to the app
	 */
	public function __construct(IAppContainer $app){
		$this->app = $app;
		$this->api = $app->getCoreApi();
	}
}