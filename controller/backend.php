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

use \OCA\Calendar\BusinessLayer\BusinessLayer;
use \OCA\Calendar\BusinessLayer\BackendBusinessLayer;
use \OCA\Calendar\BusinessLayer\BusinessLayerException;

use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;
use \OCA\Calendar\Db\DoesNotExistException;

use \OCA\Calendar\Http\Response;
use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\SerializerException;

class BackendController extends Controller {

	/**
	 * businesslayer
	 * @var \OCA\Calendar\BusinessLayer\BusinessLayer
	 */
	private $bbl;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								BackendBusinessLayer $businessLayer){
		parent::__construct($app, $request);

		$this->bbl = $businessLayer;
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allBackends = $this->bbl->setup()->subset(
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allBackends,
				$this->accept()
			);

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
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
	public function enabled() {
		try {
			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allEnabled = $this->bbl->setup()->enabled()->subset(
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allEnabled,
				$this->accept()
			);

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
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
	public function disabled() {
		try {
			$nolimit = $this->params('nolimit', false);
			if ($nolimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allDisabled = $this->bbl->setup()->disabled()->subset(
				$limit,
				$offset
			);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allDisabled,
				$this->accept()
			);

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
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
	public function defaultBackend() {
		try {
			$default = $this->bbl->getDefault();
			$backend = $this->bbl->setup()->find($default);

			if (!$backend) {
				throw new SerializerException(
					'default backend not configured or not activatable.'
				);
			}

			$serializer = new Serializer(
				$this->app,
				Serializer::Backend,
				$backend,
				$this->accept()
			);

			return new Response($serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}
}