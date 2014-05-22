<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;

use OCA\Calendar\Utility\SabreUtility;

class ICSObject extends ICS {

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'text/calendar; charset=utf-8',
			)
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	public function serialize() {
		$vcalendar = $this->object->getVObject();
		$timezoneMapper = $this->app->query('TimezoneMapper');

		SabreUtility::addMissingVTimezones(
			$vcalendar,
			$timezoneMapper
		);

		/* @var VCalendar $vcalendar */
		return $vcalendar->serialize();
	}
}