<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\IAppContainer;
use \OCP\IRequest;

use \OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use \OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use \OCA\Calendar\Db\ObjectType;

class EventController extends ObjectTypeController {

	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								ObjectBusinessLayer $objectBusinessLayer,
								CalendarBusinessLayer $calendarBusinessLayer){
		parent::__construct(
			$app,
			$request,
			$objectBusinessLayer,
			$calendarBusinessLayer,
			ObjectType::EVENT
		);
	}
}