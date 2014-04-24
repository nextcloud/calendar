<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCP\AppFramework\Http;

use \OCP\AppFramework\IAppContainer;
use \OCP\IRequest;

use \OCA\Calendar\Db\DoesNotExistException;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;
use \OCA\Calendar\Db\TimezoneMapper;

use \OCA\Calendar\Http\Response;

use \OCA\Calendar\Http\Reader;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\ReaderExpcetion;
use \OCA\Calendar\Http\SerializerException;

class TimezoneController extends Controller {

	/**
	 * timezone mapper
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	private $timezoneMapper;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								TimezoneMapper $timezoneMapper){
		parent::__construct($app, $request);

		$this->timezoneMapper = $timezoneMapper;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$nolimit = $this->params('nolimit', false);
		if($nolimit) {
			$limit = $offset = null;
		} else {
			$limit = $this->params('limit', 25);
			$offset = $this->params('offset', 0);
		}

		$timezoneCollection = $this->timezoneMapper->findAll($limit, $offset);

		$serializer = new Serializer(Serializer::TimezoneCollection, $timezoneCollection, $this->accept());
		return new Response($serializer);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show() {
		try {
			$tzId = str_replace('-', '/', $this->params('timezoneId'));

			$timezone = $this->timezoneMapper->find($tzId);

			$serializer = new Serializer(Serializer::Timezone, $timezone, $this->accept());
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
	public function destroy() {
		return new Response(null, Http::STATUS_NOT_IMPLEMENTED);
	}
}