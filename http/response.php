<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use \OCP\AppFramework\Http\Response as CoreResponse;
use \OCP\AppFramework\Http;
use \OCA\Calendar\Http\ISerializer;

class Response extends CoreResponse {

	protected $data;

	/**
	 * @param mixed $data
	 * @param int $statusCode
	 */
	public function __construct($data=null, $statusCode=null) {
		$this->data = $data;

		if ($statusCode === null) {
			if ($data === null) {
				$statusCode = Http::STATUS_NO_CONTENT;
			} else {
				$statusCode = Http::STATUS_OK;
			}
		}
		$this->setStatus($statusCode);

		if ($data instanceof ISerializer) {
			$headers = $data->getHeaders();
			foreach($headers as $key => $value) {
				$this->addHeader($key, $value);
			}
		}
	}

	/**
	 * Returns the rendered data
	 * @return string the rendered data
	 */
	public function render(){
		if (is_string($this->data)) {
			return $this->data;
		} elseif (is_array($this->data)) {
			return json_encode($this->data);
		} elseif ($this->data instanceof ISerializer) {
			$data = $this->data->serialize();

			if (is_null($data)) {
				$this->setStatus(Http::STATUS_NO_CONTENT);
				return '';
			}else if (is_array($data)) {
				return json_encode($data);
			} else {
				return $data;
			}
		} else {
			return '';
		}
	}
}