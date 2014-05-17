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
namespace OCP\Calendar;

interface IBackendCollection extends ICollection {

	/**
	 * @brief get a collection of all enabled backends within collection
	 * @return IBackendCollection of all enabled backends
	 */
	public function enabled();


	/**
	 * @brief get a collection of all disabled backends within collection
	 * @return IBackendCollection of all disabled backends
	 */
	public function disabled();


	/**
	 * @param $backendName
	 * @return IBackend
	 */
	public function find($backendName);


	/**
	 * @param string $backendName
	 * @return bool
	 */
	public function isEnabled($backendName);
}