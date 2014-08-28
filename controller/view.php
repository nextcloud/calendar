<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Raghu Nayyar
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
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

use OCP\AppFramework\Http\TemplateResponse;

class ViewController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index(){
		$this->api->addScript('../3rdparty/jquery-file-upload/js/jquery.fileupload');
		$this->api->addScript('../3rdparty/ical/ical');
		//$this->api->addScript('../3rdparty/js/recurrencejs/jquery.recurrenceinput');
		$this->api->addScript('../3rdparty/jstzdetect/jstz.min');
		$this->api->addScript('../3rdparty/fullcalendar/dist/fullcalendar.min');
		$this->api->addScript('../3rdparty/moment/min/moment.min');

		$this->api->addScript('../3rdparty/angular/angular.min');
		$this->api->addScript('../3rdparty/angular-animate/angular-animate.min');
		$this->api->addScript('../3rdparty/restangular/dist/restangular.min');
		$this->api->addScript('../3rdparty/angular-route/angular-route.min');

		$this->api->addScript('../3rdparty/angular-ui/angular-ui');
		$this->api->addScript('../3rdparty/angular-ui/angular-ui-calendar');
		$this->api->addScript('../3rdparty/angular-ui/angular-ui-sortable');
		$this->api->addScript('../3rdparty/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module');
		$this->api->addScript('../3rdparty/appframework/app');

		$this->api->addScript('public/app');


		$this->api->addStyle('calendar');
		$this->api->addStyle('part.datepicker');
		$this->api->addStyle('part.calendarlist');
		$this->api->addStyle('part.settings');
		$this->api->addStyle('part.events.dialog');

		$this->api->addStyle('../3rdparty/fullcalendar/dist/fullcalendar');
		$this->api->addStyle('../3rdparty/angular-bootstrap-colorpicker/css/colorpicker');

		return new TemplateResponse('calendar', 'main');
	}
}