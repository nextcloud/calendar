<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Http;
use OCP\AppFramework\IAppContainer;
use OCP\IRequest;
use OCP\Calendar\IBackendCollection;

use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\Serializer;
use OCA\Calendar\Http\SerializerException;

class BackendController extends Controller {

	/**
	 * @var \OCP\Calendar\IBackendCollection
	 */
	private $backends;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param IBackendCollection $backends
	 */
	public function __construct(IAppContainer $app, IRequest $request, IBackendCollection $backends) {
		parent::__construct($app, $request);
		$this->backends = $backends;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allBackends = $this->backends->subset($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allBackends,
				$this->accept()
			);

			return new Response((string) $serializer);
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
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allEnabled = $this->backends->enabled()->subset($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allEnabled,
				$this->accept()
			);

			return new Response((string) $serializer);
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
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allDisabled = $this->backends->disabled()->subset($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allDisabled,
				$this->accept()
			);

			return new Response((string) $serializer);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}
}