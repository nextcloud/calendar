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

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use \OCP\AppFramework\IAppContainer;
use \OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use \OCP\IRequest;

use OCA\Calendar\BusinessLayer\TimezoneBusinessLayer;
use OCA\Calendar\Http\JSON\JSONTimezoneResponse;

use \OCA\Calendar\Http\Response;
use \OCA\Calendar\Http\SerializerException;

class TimezoneController extends Controller {

	/**
	 * @var \OCA\Calendar\BusinessLayer\TimezoneBusinessLayer
	 */
	protected $timezones;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param TimezoneBusinessLayer $timezoneBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								TimezoneBusinessLayer $timezoneBusinessLayer){
		parent::__construct($app, $request);
		$this->timezones = $timezoneBusinessLayer;

		$this->registerResponder('json', function($value) use ($app) {
			return new JSONTimezoneResponse($app, $value);
		});
	}


	/**
	 * @param $limit
	 * @param $offset
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			$userId	= $this->api->getUserId();

			return $this->timezones->findAll(
				$userId,
				$limit,
				$offset
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new JSONResponse(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @param string $timezoneId
	 * @return Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($timezoneId) {
		try {
			$tzId = str_replace('-', '/', $timezoneId);
			$userId	= $this->api->getUserId();

			return $this->timezones->find(
				$tzId,
				$userId
			);
		} catch (BusinessLayerException $ex) {
			return new JSONResponse(
				$ex->getMessage(),
				$ex->getCode()
			);
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
	public function getList($limit=null, $offset=null) {
		$userId	= $this->api->getUserId();

		$timezones = $this->timezones->listAll($userId, $limit, $offset);

		return new JSONResponse($timezones);
	}


	/**
	 * @NoAdminRequired
	 */
	public function create() {
		return new JSONResponse(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 */
	public function update() {
		return new JSONResponse(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 */
	public function patch() {
		return new JSONResponse(null, Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @NoAdminRequired
	 */
	public function destroy() {
		return new JSONResponse(null, Http::STATUS_NOT_IMPLEMENTED);
	}
}