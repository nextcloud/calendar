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

use \OCA\Calendar\Db\Subscription;
use \OCA\Calendar\Db\SubscriptionCollection;
use \OCA\Calendar\Db\SubscriptionMapper;

use \OCA\Calendar\Http\Response;

use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\ReaderExpcetion;
use \OCA\Calendar\Http\SerializerException;

class SubscriptionController extends Controller {

	/**
	 * timezone mapper
	 * @var \OCA\Calendar\Db\SubscriptionMapper
	 */
	private $subscriptionMapper;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								SubscriptionMapper $subscriptionMapper){
		parent::__construct($app, $request);

		$this->subscriptionMapper = $subscriptionMapper;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$userId = $this->api->getUserId();
		$nolimit = $this->params('nolimit', false);
		if($nolimit) {
			$limit = $offset = null;
		} else {
			$limit = $this->params('limit', 25);
			$offset = $this->params('offset', 0);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show() {
		try {
			$userId = $this->api->getUserId();


			return new Response($serializer);
		} catch (DoesNotExistException $ex) {
			return new Response(null, Http::STATUS_NOT_FOUND);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {
		
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update() {
		
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy() {
		
	}
}