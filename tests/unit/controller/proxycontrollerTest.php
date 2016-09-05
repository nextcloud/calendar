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

class ProxyControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $client;

	private $newClient;
	private $response;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->client = $this->getMockBuilder('\OCP\Http\Client\IClientService')
			->disableOriginalConstructor()
			->getMock();

		$this->newClient = $this->getMockBuilder('\OCP\Http\Client\IClient')
			->disableOriginalConstructor()
			->getMock();
		$this->response = $this->getMockBuilder('\OCP\Http\Client\IResponse')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new ProxyController($this->appName,
			$this->request, $this->client);
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
}