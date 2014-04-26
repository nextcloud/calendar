<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;
use \OCP\AppFramework\Http;

use \OCA\Calendar\Db\Subscription;
use \OCA\Calendar\Db\SubscriptionCollection;
use \OCA\Calendar\Db\SubscriptionMapper;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\Utility;

class SubscriptionBusinessLayer extends BusinessLayer {

	/**
	 * object subscriptionmapper object
	 * @var \OCA\Calendar\Db\SubscriptionMapper
	 */
	private $smp;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param CalendarMapper $objectMapper: mapper for objects cache
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param API $api: an api wrapper instance
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								SubscriptionMapper $subscriptionMapper){

		parent::__construct($app, $backendMapper);

		$this->smp = $subscriptionMapper;
	}
}