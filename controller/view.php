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
		$this->loadCSS();
		$this->loadJS();

		return new TemplateResponse('calendar', 'main');
	}


	/**
	 * load css files
	 */
	private function loadCSS() {
		$styles = [
			'part.datepicker',
			'part.calendarlist',
			'part.settings',
			'part.events.dialog',
			'../3rdparty/fontawesome/css/font-awesome',
			'../3rdparty/fullcalendar/dist/fullcalendar',
			'../3rdparty/angular-bootstrap-colorpicker/css/colorpicker',
			'calendar',
		];

		foreach ($styles as $style) {
			$this->api->addStyle($style);
		}
	}


	/**
	 * load js files
	 */
	private function loadJS() {
		$scripts = [
			'../3rdparty/jquery-file-upload/js/jquery.fileupload',
			'../3rdparty/ical/ical',
			//'../3rdparty/js/recurrencejs/jquery.recurrenceinput',
			'../3rdparty/jstzdetect/jstz.min',
			'../3rdparty/fullcalendar/dist/fullcalendar.min',
			'../3rdparty/moment/min/moment.min',
			'../3rdparty/angular/angular.min',
			'../3rdparty/angular-animate/angular-animate.min',
			'../3rdparty/restangular/dist/restangular.min',
			'../3rdparty/angular-route/angular-route.min',
			'../3rdparty/angular-ui/angular-ui',
			'../3rdparty/angular-ui/angular-ui-calendar',
			'../3rdparty/angular-ui/angular-ui-sortable',
			'../3rdparty/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module',
			'../3rdparty/appframework/app',
			'public/app',
		];

		foreach ($scripts as $script) {
			$this->api->addScript($script);
		}
	}
}