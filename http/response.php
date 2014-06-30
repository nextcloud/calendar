<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
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