<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\Http;

class BusinessLayerException extends \Exception {

	/**
	 * @brief Constructor
	 * @param string $message
	 * @param integer $code
	 * @param Exception $previous
	 */
	public function __construct($message=null, $code=null, \Exception $previous=null) {
		if($code === null) {
			$code = Http::STATUS_BAD_REQUEST;
		}

		parent::__construct($message, $code, $previous);
	}
}