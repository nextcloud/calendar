<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Http;

abstract class JSONReader extends Reader {

	/**
	 * array that represents the json input data
	 * @var array
	 */
	protected $json;


	/**
	 * @param resource $handle
	 */
	public function __construct($handle) {
		parent::__construct($handle);

		$this->parseJson();
	}


	/**
	 * parse json-string and put into $this->json
	 */
	private function parseJson() {
		$data = stream_get_contents($this->handle);
		$json = json_decode($data, true);

		if ($json === null) {
			throw new ReaderException(
				'Could not decode json string.'
			);
		}

		$this->json = $json;
	}
}