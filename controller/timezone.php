<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\IAppContainer;
use \OCP\AppFramework\Http;
use \OCP\IRequest;

use \OCA\Calendar\Db\DoesNotExistException;

use OCA\Calendar\BusinessLayer\TimezoneBusinessLayer;

use \OCA\Calendar\Http\Response;
use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\ReaderException;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\SerializerException;

class TimezoneController extends Controller {

	/**
	 * timezone mapper
	 * @var TimezoneMapper
	 */
	private $timezoneMapper;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param TimezoneMapper $timezoneMapper
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								TimezoneBusinessLayer $timezoneBusinessLayer){
		parent::__construct($app, $request);

		$this->timezoneMapper = $timezoneMapper;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$userId	= $this->api->getUserId();

			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$timezoneCollection = $this->businessLayer->findAll(
				$userId,
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::TimezoneCollection,
				$timezoneCollection,
				$this->accept()
			);

			return new Response($serializer);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show() {
		try {
			$tzId = str_replace('-', '/', $this->params('timezoneId'));
			$userId	= $this->api->getUserId();

			$timezone = $this->timezoneMapper->find(
				$userId,
				$tzId
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::Timezone,
				$timezone, 
				$this->accept()
			);

			return new Response($serializer);
		} catch (DoesNotExistException $ex) {
			return new Response(
				null,
				Http::STATUS_NOT_FOUND
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function getList() {
		$timezones = $this->timezoneMapper->getList();
		return new Response($timezones);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function create() {
		return new Response(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function update() {
		return new Response(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function patch() {
		return new Response(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function destroy() {
		return new Response(null, Http::STATUS_NOT_IMPLEMENTED);
	}
}