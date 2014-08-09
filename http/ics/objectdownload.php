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
namespace OCA\Calendar\Http\ICS;

use OCP\AppFramework\IAppContainer;
use OCA\Calendar\Utility\ObjectUtility;

use OCA\Calendar\Http\TextDownloadResponse;

class ICSObjectDownloadResponse extends TextDownloadResponse {

	/**
	 * @var string
	 */
	private $data;


	/**
	 * constructor of JSONResponse
	 * @param IAppContainer $app
	 * @param \OCP\Calendar\IObjectCollection $data
	 * @param string $mimeType
	 * @param string $filename
	 */
	public function __construct(IAppContainer $app, $data,
								$mimeType, $filename) {
		$this->app = $app;
		$this->input = $data;

		$this->serializeData();

		parent::__construct($this->data, $filename, $mimeType);
	}


	public function serializeData() {
		ObjectUtility::serializeDataWithTimezones($this->input, $this->app, $this->data, false);
	}
}