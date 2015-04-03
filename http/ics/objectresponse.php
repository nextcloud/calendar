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

use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\IObject;
use OCA\Calendar\Utility\SabreUtility;

use OCP\AppFramework\Http;

class ObjectResponse extends Http\DataResponse {

	/**
	 * @param \OCA\Calendar\IObject|\OCA\Calendar\IObjectCollection $data
	 * @param TimezoneMapper $timezones
	 * @param int $statusCode
	 */
	public function __construct($data, TimezoneMapper $timezones=null, $statusCode=Http::STATUS_OK) {
		$vobject = $data->getVObject();
		if ($vobject) {
			if ($timezones) {
				SabreUtility::addMissingVTimezones($vobject, $timezones);
			}

			$serialized = $vobject->serialize();

			parent::__construct($serialized, $statusCode, [
				'Content-type' => 'text/calendar; charset=utf-8',
			]);

			if ($data instanceof IObject) {
				$this->setETag($this->data->getEtag(true));
			}
		} else {
			parent::__construct(null, HTTP::STATUS_NO_CONTENT);
		}
	}
}