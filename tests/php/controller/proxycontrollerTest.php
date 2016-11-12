<?php
/**
 * Calendar App
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

class ProxyControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $client;
	private $l10n;
	private $logger;

	private $newClient;
	private $response;
	private $exceptionRequest;
	private $exceptionResponse;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->client = $this->getMockBuilder('\OCP\Http\Client\IClientService')
			->disableOriginalConstructor()
			->getMock();
		$this->l10n = $this->getMockBuilder('\OCP\IL10N')
			->disableOriginalConstructor()
			->getMock();
		$this->logger = $this->getMockBuilder('\OCP\ILogger')
			->disableOriginalConstructor()
			->getMock();

		$this->newClient = $this->getMockBuilder('\OCP\Http\Client\IClient')
			->disableOriginalConstructor()
			->getMock();
		$this->response = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();

		$this->exceptionRequest = $this->getMockBuilder('GuzzleHttp\Message\RequestInterface')
			->disableOriginalConstructor()
			->getMock();
		$this->exceptionResponse = $this->getMockBuilder('GuzzleHttp\Message\ResponseInterface')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new ProxyController($this->appName, $this->request,
			$this->client, $this->l10n, $this->logger);
	}

	public function testProxy() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'stream' => true,
			])
			->will($this->returnValue($this->response));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCA\Calendar\Http\StreamResponse', $actual);
		$this->assertEquals('text/calendar', $actual->getHeaders()['Content-Type']);
	}

	public function testProxyClientException() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'stream' => true,
			])
			->will($this->throwException(new ClientException('Exception Message foo bar 42',
				$this->exceptionRequest, $this->exceptionResponse)));
		$this->exceptionResponse->expects($this->once())
			->method('getStatusCode')
			->will($this->returnValue(403));
		$this->l10n->expects($this->once())
			->method('t')
			->with($this->equalTo('The remote server did not give us access to the calendar (HTTP {%s} error)', '403'))
			->will($this->returnValue('translated string 1337'));
		$this->logger->expects($this->once())
			->method('debug')
			->with($this->equalTo('Exception Message foo bar 42'));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals('422', $actual->getStatus());
		$this->assertEquals([
			'message' => 'translated string 1337',
			'proxy_code' => 403
		], $actual->getData());
	}

	public function testProxyConnectException() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'stream' => true,
			])
			->will($this->throwException(new ConnectException('Exception Message foo bar 42',
				$this->exceptionRequest, $this->exceptionResponse)));
		$this->l10n->expects($this->once())
			->method('t')
			->with($this->equalTo('Error connecting to remote server'))
			->will($this->returnValue('translated string 1337'));
		$this->logger->expects($this->once())
			->method('debug')
			->with($this->equalTo('Exception Message foo bar 42'));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals('422', $actual->getStatus());
		$this->assertEquals([
			'message' => 'translated string 1337',
			'proxy_code' => -1
		], $actual->getData());
	}

	public function testProxyRequestExceptionHTTP() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'stream' => true,
			])
			->will($this->throwException(new RequestException('Exception Message foo bar 42',
				$this->exceptionRequest, $this->exceptionResponse)));
		$this->l10n->expects($this->once())
			->method('t')
			->with($this->equalTo('Error requesting resource on remote server'))
			->will($this->returnValue('translated string 1337'));
		$this->logger->expects($this->once())
			->method('debug')
			->with($this->equalTo('Exception Message foo bar 42'));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals('422', $actual->getStatus());
		$this->assertEquals([
			'message' => 'translated string 1337',
			'proxy_code' => -2
		], $actual->getData());
	}

	public function testProxyRequestExceptionHTTPS() {
		$testUrl = 'https://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'stream' => true,
			])
			->will($this->throwException(new RequestException('Exception Message foo bar 42',
				$this->exceptionRequest, $this->exceptionResponse)));
		$this->l10n->expects($this->once())
			->method('t')
			->with($this->equalTo('Error requesting resource on remote server. This could possible be related to a certificate mismatch'))
			->will($this->returnValue('translated string 1337'));
		$this->logger->expects($this->once())
			->method('debug')
			->with($this->equalTo('Exception Message foo bar 42'));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals('422', $actual->getStatus());
		$this->assertEquals([
			'message' => 'translated string 1337',
			'proxy_code' => -2
		], $actual->getData());
	}
}
