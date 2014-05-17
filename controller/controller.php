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
use OCP\IRequest;

use OCA\Calendar\BusinessLayer\BusinessLayer;

use DateTime;

abstract class Controller extends \OCP\AppFramework\Controller {

	/**
	 * app container
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;

	/**
	 * core api
	 * @var \OCP\AppFramework\IApi
	 */
	protected $api;


	/**
	 * business-layer
	 * @var \OCA\Calendar\BusinessLayer\BusinessLayer
	 */
	protected $businesslayer;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param BusinessLayer $businessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request, $businessLayer=null) {
		parent::__construct($app, $request);
		$this->app = $app;
		$this->api = $app->getCoreApi();
		if ($businessLayer instanceof BusinessLayer) {
			$this->businesslayer = $businessLayer;
		}
	}


	/**
	 * get a param
	 * @param string $key
	 * @param mixed $default
	 * @return mixed $value
	 */
	public function params($key, $default=null){
		$value = parent::params($key, $default);
		if ($default !== null) {
			if ($default instanceof DateTime) {
				$value = DateTime::createFromFormat(DateTime::ISO8601, $value);
			} else {
				settype($value, gettype($default));
			}
		}
		return $value;
	}


	/*
	 * Lets you access http request header
	 * @param string $key the key which you want to access in the http request header
	 * @param mixed $default If the key is not found, this value will be returned
	 * @return mixed content of header field
	 */
	protected function header($key, $type='string', $default=null){
		$key = 'HTTP_' . strtoupper($key);

		$key = str_replace('-', '_', $key);

		if (isset($this->request->server[$key]) === false) {
			return $default;
		} else {
			$value = $this->request->server[$key];
			if (strtolower($type) === 'datetime') {
				$value = \DateTime::createFromFormat(\DateTime::ISO8601);
			} else {
				settype($value, $type);
			}
			return $value;
		}
	}


	/*
	 * get accept header
	 * @return string
	 */
	protected function accept() {
		$accept = $this->header('accept');

		if (substr_count($accept, ',')) {
			list($accept) = explode(',', $accept);
		}
		if (substr_count($accept, ';')) {
			list($accept) = explode(';', $accept);
		}

		return $accept;
	}


	/*
	 * get content type header
	 * @return string
	 */
	protected function contentType() {
		$contentType = $this->header('content-type');

		if (substr_count($contentType, ';')) {
			list($contentType) = explode(';', $contentType);
		}

		return $contentType;
	}
}