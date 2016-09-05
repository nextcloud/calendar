<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

use GuzzleHttp\Exception\ClientException;
use OCA\Calendar\Http\StreamResponse;
use OCP\AppFramework\Http\JSONResponse;

use OCP\AppFramework\Controller;
use OCP\Http\Client\IClientService;
use OCP\IRequest;

class ProxyController extends Controller {

	/**
	 * @var IClientService
	 */
	protected $client;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IClientService $client
	 */
	public function __construct($appName, IRequest $request,
								IClientService $client) {
		parent::__construct($appName, $request);
		$this->client = $client;
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param $url
	 * @return StreamResponse|JSONResponse
	 */
	public function proxy($url) {
		$client = $this->client->newClient();
		try {
			$clientResponse = $client->get($url, [
				'stream' => true,
			]);
			$response = new StreamResponse($clientResponse->getBody());
			$response->setHeaders([
				'Content-Type' => 'text/calendar',
			]);
		} catch (ClientException $e) {
			$error_code = $e->getResponse()->getStatusCode();
			$response = new JSONResponse();
			$response->setHeaders([
				'Content-Type' => 'text/calendar',
			]);
			$response->setStatus($error_code);
		}
		return $response;
	}
}
