<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use OCP\AppFramework\Http\Response as CoreResponse;
use OCP\AppFramework\Http;

class Response extends CoreResponse {

	/**
	 * data for output
	 * @var mixed
	 */
	protected $data;


	/**
	 * @param mixed $data
	 * @param int $statusCode
	 */
	public function __construct($data=null, $statusCode=null) {
		$this->data = $data;

		if (is_null($statusCode)) {
			if (is_null($data)) {
				$this->setStatus(Http::STATUS_NO_CONTENT);
			} else {
				$this->setStatus(Http::STATUS_OK);
			}
		} else {
			$this->setStatus($statusCode);
		}

		if ($data instanceof ISerializer || $data instanceof Serializer) {
			/**
			 * @var ISerializer $data
			 * Serializer hands over calls to ISerializer instance
			 */
			$this->addHeaders($data->getHeaders());
		}
	}


	/**
	 * Returns the rendered data
	 * @return string the rendered data
	 */
	public function render(){
		$data = $this->data;

		if ($data instanceof ISerializer || $data instanceof Serializer) {
			/**
			 * @var ISerializer $data
			 * Serializer hands over calls to ISerializer instance
			 */
			$data = $data->serialize();
		}

		if (is_string($data)) {
			return $data;
		}
		if (is_array($data)) {
			return json_encode($data);
		}
		return '';
	}


	/**
	 * @brief add array of headers
	 */
	private function addHeaders(array $headers) {
		foreach($headers as $key => $value) {
			$this->addHeader($key, $value);
		}
	}
}