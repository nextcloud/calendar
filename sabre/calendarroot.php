<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Thomas Tanghus <thomas@tanghus.net>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Sabre;

use Sabre_CalDAV_CalendarRootNode;

/**
 * This class overrides Sabre_CalDAV_CalendarRootNode::getChildForPrincipal()
 * to instantiate OC_Connector_Sabre_CalDAV_UserCalendars.
*/
class CalDAV_CalendarRoot extends Sabre_CalDAV_CalendarRootNode {

	/**
	* This method returns a node for a principal.
	*
	* The passed array contains principal information, and is guaranteed to
	* at least contain a uri item. Other properties may or may not be
	* supplied by the authentication backend.
	*
	* @param array $principal
	* @return Sabre_DAV_INode
	*/
	public function getChildForPrincipal(array $principal) {

		return new CalDAV_UserCalendars($this->principalBackend,
										$this->caldavBackend,
										$principal['uri']);

	}
}