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
namespace OCA\Calendar\Controller;

use OCP\AppFramework\IAppContainer;
use OCP\IRequest;
use OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use OCA\Calendar\BusinessLayer\ObjectRequestBusinessLayer;
use OCA\Calendar\Db\ObjectType;

class JournalController extends ObjectTypeController {

	/**
	 * constructor
	 * @param IAppContainer $app interface to the app
	 * @param IRequest $request an instance of the request
	 * @param ObjectRequestBusinessLayer $objectBusinessLayer
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 */
	public function __construct(IAppContainer $app, IRequest $request,
								ObjectRequestBusinessLayer $objectBusinessLayer,
								CalendarBusinessLayer $calendarBusinessLayer){
		parent::__construct(
			$app,
			$request,
			$objectBusinessLayer,
			$calendarBusinessLayer,
			ObjectType::JOURNAL
		);
	}
}