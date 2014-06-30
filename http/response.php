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
namespace OCA\Calendar\Http;

use OCP\AppFramework\IAppContainer;
use OCP\AppFramework\Http\Response as CoreResponse;
use OCP\AppFramework\Http;
use OCP\Calendar\IEntity;
use OCP\Calendar\ICollection;

abstract class Response extends CoreResponse {

	/**
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * @var ICollection|IEntity
	 */
	protected $input;


	/**
	 * data for output
	 * @var mixed
	 */
	protected $data;


	/**
	 * constructor of JSONResponse
	 * @param IAppContainer $app
	 * @param IEntity|ICollection $data
	 */
	public function __construct(IAppContainer $app, $data) {
		$this->app = $app;
		$this->input = $data;

		$this->preSerialize();
		$this->serializeData();
		$this->postSerialize();
	}


	abstract public function preSerialize();


	abstract public function serializeData();


	abstract public function postSerialize();
}