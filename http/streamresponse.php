<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\Calendar\Http;

use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;

class StreamResponse extends Response implements ICallbackResponse {

	/**
	 * @var resource
	 */
	protected $stream;

	/**
	 * @param resource $stream
	 */
	public function __construct ($stream) {
		$this->stream = $stream;
	}


	/**
	 * @param IOutput $output a small wrapper that handles output
	 */
	public function callback (IOutput $output) {
		rewind($this->stream);
		fpassthru($this->stream);
	}

}
