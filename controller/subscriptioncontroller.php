<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\Http;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use \OCA\Calendar\Http\Response;

use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\ReaderExpcetion;
use \OCA\Calendar\Http\SerializerException;

class SubscriptionController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show() {}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update() {}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy() {}
}