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

use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http;
use OCP\Calendar\IEntity;
use OCP\Calendar\ICollection;
use OCP\IRequest;

use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Http\SerializerException;

use DateTime;

abstract class Controller extends \OCP\AppFramework\Controller {

	/**
	 * array of input parsers
	 * @var array
	 */
	private $readers;


	/**
	 * id for current user
	 * @var string
	 */
	protected $userId;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param string $userId
	 */
	public function __construct($appName, IRequest $request, $userId) {
		parent::__construct($appName, $request);
		$this->userId = $userId;
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
	 * @param string &$string DateTime
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


	/**
	 * @param \Exception $ex
	 * @return JSONResponse
	 */
	protected function handleException(\Exception $ex) {
		\OC::$server->getLogger()->debug($ex->getMessage());

		$code = $ex->getCode();
		if ($code === null) {
			if ($ex instanceof ReaderException) {
				$code = Http::STATUS_UNPROCESSABLE_ENTITY;
			} elseif ($ex instanceof SerializerException) {
				$code = Http::STATUS_INTERNAL_SERVER_ERROR;
			} else {
				$code = HTTP::STATUS_INTERNAL_SERVER_ERROR;
			}

		}

		return new JSONResponse(
			['message' => $ex->getMessage()],
			$code
		);
	}
}