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
namespace OCA\Calendar\Http\JSON;

use OCP\AppFramework\Http;
use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\Utility\ObjectUtility;
use OCA\Calendar\IObject;
use OCA\Calendar\Http\JSONResponse;

class JSONObjectResponse extends JSONResponse {

	/**
	 * @var TimezoneMapper
	 */
	protected $timezones;


	/**
	 * @param \OCA\Calendar\IObjectCollection|\OCA\Calendar\IObject $data
	 * @param TimezoneMapper $timezones
	 * @param integer $statusCode
	 *
	 * TODO - use TimezoneBusinessLayer instead of TimezoneMapper
	 */
	public function __construct($data, TimezoneMapper $timezones,
								$statusCode=Http::STATUS_OK) {
		parent::__construct($data, $statusCode);

		$this->timezones = $timezones;
		$this->addHeader('Content-type', 'application/calendar+json; charset=utf-8');

		if ($this->data instanceof IObject) {
			$this->setETag($this->data->getEtag(true));
		}
	}


	/**
	 * serialize Data and add missing timezones
	 */
	public function render() {
		return json_encode(ObjectUtility::serializeDataWithTimezones(
			$this->data,
			$this->timezones,
			true
		));
	}
}