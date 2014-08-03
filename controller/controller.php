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

use OCA\Calendar\Http\ReaderException;
use OCP\AppFramework\IAppContainer;
use OCP\IRequest;
use OCP\Calendar\IEntity;
use OCP\Calendar\ICollection;
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
	 * @var array
	 */
	private $readers;


	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 */
	public function __construct(IAppContainer $app, IRequest $request) {
		parent::__construct($app, $request);
		$this->app = $app;
		$this->api = $app->getCoreApi();
	}


	/**
	 * Parses an HTTP accept header and returns the supported responder type
	 * @return string the responder type
	 */
	protected function getReaderByHTTPHeader() {
		$contentType = $this->contentType();

		$reader = str_replace('application/', '', $contentType);
		if (array_key_exists($reader, $this->readers)) {
			return $reader;
		}

		return null;
	}


	/**
	 * Registers a reader for a type
	 * @param string $format
	 * @param \Closure $reader
	 */
	protected function registerReader($format, \Closure $reader) {
		$this->readers[$format] = $reader;
	}


	/**
	 * Reads the input
	 * @param resource $handle
	 * @param string $format the format for which a formatter has been registered
	 * @throws ReaderException if format does not match a registered formatter
	 * @return IEntity|ICollection
	 */
	protected function buildReader($handle, $format) {
		if(array_key_exists($format, $this->readers)) {

			$reader = $this->readers[$format];

			return $reader($handle);

		} else {
			throw new ReaderException('No reader registered for format ' .
				$format . '!');
		}
	}


	/**
	 * reads input
	 * @return IEntity|ICollection
	 */
	protected function readInput() {
		$reader = $this->getReaderByHTTPHeader();
		$handle = fopen('php://input', 'rb');

		return $this->buildReader($handle, $reader);
	}


	/**
	 * @param string DateTime
	 * @param \DateTime $default
	 */
	protected function parseDateTime(&$string, \DateTime $default) {
		$datetime = \DateTime::createFromFormat('U', $string);

		if ($string === null || $datetime === false) {
			$string = $default;
		} else {
			$string = $datetime;
		}
	}


	/**
	 * get accept header
	 * @return array
	 */
	protected function accept() {
		$accept = $this->request->getHeader('ACCEPT');

		$accepts = explode(',', $accept);
		$accepts = array_map(function($value) {
			list($preSemicolon) = explode(';', $value);
			return $preSemicolon;
		}, $accepts);

		return $accepts;
	}


	/**
	 * get content type header
	 * @return string
	 */
	protected function contentType() {
		$contentType = $this->request->getHeader('CONTENT_TYPE');

		list($contentType) = explode(';', $contentType);

		return $contentType;
	}
}