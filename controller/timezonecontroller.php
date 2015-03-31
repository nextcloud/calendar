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

use OCA\Calendar\BusinessLayer\Timezone;
use OCA\Calendar\Http\JSON;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

class TimezoneController extends Controller {

	/**
	 * BusinessLayer for managing timezones
	 * @var Timezone
	 */
	protected $timezones;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param Timezone $timezoneBusinessLayer
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								Timezone $timezoneBusinessLayer){
		parent::__construct($appName, $request, $userSession);
		$this->timezones = $timezoneBusinessLayer;

		$this->registerResponder('json', function($value) {
			return new JSON\TimezoneResponse($value, $this->getSuccessfulStatusCode());
		});
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($limit=null, $offset=null) {
		try {
			return $this->timezones->findAll(
				$this->user->getUID(),
				$limit,
				$offset
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @param string $id
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function show($id) {
		try {
			$tzId = str_replace('-', '/', $id);

			return $this->timezones->find(
				$tzId,
				$this->user->getUID()
			);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * @return \OCP\AppFramework\Http\Response
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getList() {
		$timezones = $this->timezones->listAll($this->user->getUID());
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