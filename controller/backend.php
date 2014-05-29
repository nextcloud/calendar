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

use OCP\AppFramework\Http;

use OCA\Calendar\BusinessLayer\BusinessLayerException;

use OCA\Calendar\Http\Response;
use OCA\Calendar\Http\Serializer;
use OCA\Calendar\Http\SerializerException;

class BackendController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		try {
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allBackends = $this->businesslayer->findAll($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allBackends,
				$this->accept()
			);

			return new Response((string) $serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function enabled() {
		try {
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allEnabled = $this->businesslayer->findAllEnabled($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allEnabled,
				$this->accept()
			);

			return new Response((string) $serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function disabled() {
		try {
			$noLimit = $this->params('nolimit', false);
			if ($noLimit) {
				$limit = $offset = null;
			} else {
				$limit = $this->params('limit', 25);
				$offset = $this->params('offset', 0);
			}

			$allDisabled = $this->businesslayer->findAllDisabled($limit, $offset);

			$serializer = new Serializer(
				$this->app,
				Serializer::BackendCollection,
				$allDisabled,
				$this->accept()
			);

			return new Response((string) $serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function defaultBackend() {
		try {
			$backend = $this->businesslayer->getDefault();

			$serializer = new Serializer(
				$this->app,
				Serializer::Backend,
				$backend,
				$this->accept()
			);

			return new Response((string) $serializer);
		} catch (BusinessLayerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				$ex->getCode()
			);
		} catch (SerializerException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			return new Response(
				array('message' => $ex->getMessage()),
				Http::STATUS_INTERNAL_SERVER_ERROR
			);
		}
	}
}