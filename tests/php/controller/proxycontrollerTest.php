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

use OCP\AppFramework\Http\DataDisplayResponse;
use PHPUnit\Framework\TestCase;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ConnectException;

class ProxyControllerTest extends TestCase {

	private $appName;
	private $request;
	private $client;
	private $l10n;
	private $logger;

	private $newClient;
	private $response0;
	private $response1;
	private $response2;
	private $response3;
	private $response4;
	private $response5;
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
		$this->response0 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();
		$this->response1 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();
		$this->response2 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();
		$this->response3 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();
		$this->response4 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();
		$this->response5 = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();

		if (version_compare(\OC::$server->getConfig()->getSystemValue('version'), '14', '>=')) {
			$this->exceptionRequest = $this->getMockBuilder('Psr\Http\Message\RequestInterface')
				->disableOriginalConstructor()
				->getMock();
			$this->exceptionResponse = $this->getMockBuilder('Psr\Http\Message\ResponseInterface')
				->disableOriginalConstructor()
				->getMock();
		} else {
			$this->exceptionRequest = $this->getMockBuilder('GuzzleHttp\Message\RequestInterface')
				->disableOriginalConstructor()
				->getMock();
			$this->exceptionResponse = $this->getMockBuilder('GuzzleHttp\Message\ResponseInterface')
				->disableOriginalConstructor()
				->getMock();
		}

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
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->response0->expects($this->once())
			->method('getStatusCode')
			->with()
			->will($this->returnValue(200));
		$this->response0->expects($this->once())
			->method('getBody')
			->with()
			->will($this->returnValue("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sabre//Sabre VObject 4.1.6//EN\r\nCALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n"));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf(DataDisplayResponse::class, $actual);
		$this->assertEquals('text/calendar', $actual->getHeaders()['Content-Type']);
		$this->assertEquals("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sabre//Sabre VObject 4.1.6//EN\r\nCALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n", $actual->getData());
	}

	public function testProxyClientException() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->once())
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
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
				'allow_redirects' => false,
			])
			->will($this->throwException(new ConnectException('Exception Message foo bar 42',
				$this->exceptionRequest)));
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
				'allow_redirects' => false,
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
				'allow_redirects' => false,
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

	public function testProxyRedirect() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->at(0))
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->response0->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response0->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456'));
		$this->newClient->expects($this->at(1))
			->method('get')
			->with('http://def.abc/foobar?456', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->response0->expects($this->at(2))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(200));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([
			'proxy_code' => -4,
			'new_url' => 'http://def.abc/foobar?456',
		], $actual->getData());
	}

	public function testProxyRedirectNonPermanent() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->at(0))
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->response0->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(307));
		$this->newClient->expects($this->at(1))
			->method('get')
			->with('http://abc.def/foobar?123' , [
				'allow_redirects' => [
					'max' => 5,
				],
			])
			->will($this->returnValue($this->response1));
		$this->response1->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(200));
		$this->response1->expects($this->once())
			->method('getBody')
			->with()
			->will($this->returnValue("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sabre//Sabre VObject 4.1.6//EN\r\nCALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n"));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf(DataDisplayResponse::class, $actual);
		$this->assertEquals('text/calendar', $actual->getHeaders()['Content-Type']);
		$this->assertEquals("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sabre//Sabre VObject 4.1.6//EN\r\nCALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n", $actual->getData());
	}

	public function testProxyMultipleRedirects() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->at(0))
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->newClient->expects($this->at(1))
			->method('get')
			->with('http://def.abc/foobar?456' , [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response1));
		$this->newClient->expects($this->at(2))
			->method('get')
			->with('http://xyz.abc/foobar?789' , [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response2));
		$this->response0->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response0->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456'));
		$this->response1->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response1->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://xyz.abc/foobar?789'));
		$this->response2->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(200));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([
			'proxy_code' => -4,
			'new_url' => 'http://xyz.abc/foobar?789',
		], $actual->getData());
	}

	public function testProxyMultipleRedirectsNonPermanent() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->at(0))
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->newClient->expects($this->at(1))
			->method('get')
			->with('http://def.abc/foobar?456' , [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response1));
		$this->response0->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response0->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456'));
		$this->response1->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(307));

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([
			'proxy_code' => -4,
			'new_url' => 'http://def.abc/foobar?456',
		], $actual->getData());
	}

	public function testProxyAtMostFiveRedirects() {
		$testUrl = 'http://abc.def/foobar?123';

		$this->client->expects($this->once())
			->method('newClient')
			->will($this->returnValue($this->newClient));
		$this->newClient->expects($this->at(0))
			->method('get')
			->with($testUrl, [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response0));
		$this->newClient->expects($this->at(1))
			->method('get')
			->with('http://def.abc/foobar?456-0', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response1));
		$this->newClient->expects($this->at(2))
			->method('get')
			->with('http://def.abc/foobar?456-1', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response2));
		$this->newClient->expects($this->at(3))
			->method('get')
			->with('http://def.abc/foobar?456-2', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response3));
		$this->newClient->expects($this->at(4))
			->method('get')
			->with('http://def.abc/foobar?456-3', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response4));
		$this->newClient->expects($this->at(5))
			->method('get')
			->with('http://def.abc/foobar?456-4', [
				'allow_redirects' => false,
			])
			->will($this->returnValue($this->response5));
		$this->response0->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response0->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-0'));
		$this->response1->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response1->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-1'));
		$this->response2->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response2->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-2'));
		$this->response3->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response3->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-3'));
		$this->response4->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response4->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-4'));
		$this->response5->expects($this->at(0))
			->method('getStatusCode')
			->with()
			->will($this->returnValue(301));
		$this->response5->expects($this->at(1))
			->method('getHeader')
			->with('Location')
			->will($this->returnValue('http://def.abc/foobar?456-5'));
		$this->l10n->expects($this->once())
			->method('t')
			->with($this->equalTo('Too many redirects. Aborting ...'))
			->will($this->returnValue('translated string 1337'));
		$this->newClient->expects($this->exactly(6))
			->method('get');

		$actual = $this->controller->proxy($testUrl);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([
			'proxy_code' => -3,
			'message' => 'translated string 1337',
		], $actual->getData());
	}


}
