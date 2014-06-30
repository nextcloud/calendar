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

use OCP\AppFramework\IAppContainer;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\Calendar\IBackendCollection;

use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\JSON\JSONBackendResponse;
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
	public function __construct(IAppContainer $app, IRequest $request,
								IBackendCollection $backends) {
		parent::__construct($app, $request);
		$this->backends = $backends;

		$this->registerResponder('json', function($value) use ($app) {
			return new JSONBackendResponse($app, $value);
		});
	}

	/**
	 * @param int $limit
	 * @param int $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			return $this->backends->subset($limit, $offset);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function enabled($limit, $offset) {
		try {
			return $this->backends->enabled()->subset($limit, $offset);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param int $limit
	 * @param int $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function disabled($limit, $offset) {
		try {
			return $this->backends->disabled()->subset($limit, $offset);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}
}