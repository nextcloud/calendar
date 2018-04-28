<?php

namespace OCA\Calendar\Controller;

class SettingsControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $mapper;
	private $userSession;
	private $dummyUser;

	private $controller;



	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param OtoLayerMapper $mapper the dbo mapper
	 * @param IUserSession $userSession
	 */

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->mapper = $this->getMockBuilder('\OCP\OtoLayerMapper')
			->disableOriginalConstructor()
			->getMock();
		$this->userSession = $this->getMockBuilder('OCP\IUserSession')
			->disableOriginalConstructor()
			->getMock();
		$this->dummyUser = $this->getMockBuilder('OCP\IUser')
			->disableOriginalConstructor()
			->getMock();

		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->controller = new OtoLayerController($this->appName,
			$this->mapper, $this->request, $this->userSession);
    }
    



    
}