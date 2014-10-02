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
use OCP\Calendar\IBackendCollection;
use OCP\IRequest;

use OCA\Calendar\Http\JSON\JSONBackendResponse;

class BackendController extends Controller {

	/**
	 * Collection of initialized backends
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param string $userId
	 * @param IBackendCollection $backends
	 */
	public function __construct($appName, IRequest $request, $userId,
								IBackendCollection $backends) {
		parent::__construct($appName, $request, $userId);
		$this->backends = $backends;

		$this->registerResponder('json', function($value) {
			return new JSONBackendResponse($value);
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
			return $this->backends->subset($limit, $offset);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}
}