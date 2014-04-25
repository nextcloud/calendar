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
	 * @return mixed (\OCA\Calendar\Db\Entity|\OCA\Calendar\Db\Collection)
	 */
	public function getObject();


	/**
	 * @brief is object a collection
	 * @return boolean
	 */
	public function isCollection();


	/**
	 * @brief parse data
	 */
	public function parse();


	/**
	 * @brief set data
	 * @param mixed $data
	 */
	public function setData($data);
}