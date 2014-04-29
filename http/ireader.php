<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

interface IReader {

	/**
	 * @brief get object
	 * @return mixed (Entity|Collection)
	 */
	public function getObject();


	/**
	 * @brief parse data
	 * @return $this
	 */
	public function parse();


	/**
	 * @brief sanitize data
	 * @return $this
	 */
	public function sanitize();
}