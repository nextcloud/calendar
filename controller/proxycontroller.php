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

use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ConnectException;

use OCA\Calendar\Http\StreamResponse;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Controller;
use OCP\Http\Client\IClientService;
use OCP\IL10N;
use OCP\ILogger;
use OCP\IRequest;

class ProxyController extends Controller {

	/**
	 * @var IClientService
	 */
	protected $client;

	/**
	 * @var IL10N
	 */
	protected $l10n;

	/**
	 * @var ILogger
	 */
	protected $logger;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IClientService $client
	 * @param IL10N $l10n
	 * @param ILogger $logger
	 */
	public function __construct($appName, IRequest $request,
								IClientService $client,
								IL10N $l10n, ILogger $logger) {
		parent::__construct($appName, $request);
		$this->client = $client;
		$this->l10n = $l10n;
		$this->logger = $logger;
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
			$message = $e->getMessage();

			$this->logger->debug($message);
			$response = new JSONResponse([
				'message' => $this->l10n->t('The remote server did not give us access to the calendar (HTTP {%s} error)', [
					(string) $error_code
				]),
				'proxy_code' => $error_code
			], Http::STATUS_UNPROCESSABLE_ENTITY);
		} catch (ConnectException $e) {
			$this->logger->debug($e->getMessage());
			$response = new JSONResponse([
				'message' => $this->l10n->t('Error connecting to remote server'),
				'proxy_code' => -1
			], Http::STATUS_UNPROCESSABLE_ENTITY);
		} catch (RequestException $e) {
			$this->logger->debug($e->getMessage());

			if (substr($url, 0, 8) === 'https://') {
				$message = $this->l10n->t('Error requesting resource on remote server. This could possible be related to a certificate mismatch');
			} else {
				$message = $this->l10n->t('Error requesting resource on remote server');
			}

			$response = new JSONResponse([
				'message' => $message,
				'proxy_code' => -2,
			], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		return $response;
	}
}
