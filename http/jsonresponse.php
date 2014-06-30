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

/**
 * Public interface of ownCloud for apps to use.
 * AppFramework\HTTP\JSONResponse class
 */

namespace OCA\Calendar\Http;

/**
 * A renderer for JSON calls
 */
class JSONResponse extends Response {

	/**
	 * Returns the rendered json
	 * @return string the rendered json
	 */
	public function render(){
		return json_encode($this->data);
	}


	public function preSerialize() {
		$this->addHeader('Content-type', 'application/json; charset=utf-8');
	}


	public function serializeData() {
		$this->data = $this->input;
	}


	public function postSerialize() {

	}
}