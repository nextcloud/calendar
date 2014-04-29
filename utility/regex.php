<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

class RegexUtility {

	/**
	 * regex for slugified uri
	 * @var string
	 */
	const URI = '/[A-Za-z0-9]+/';


	/**
	 * regex for rgba
	 * @var string
	 */
	const RGBA = '/#((?:[0-9a-fA-F]{2}){3}|(?:[0-9a-fA-F]{1}){3}|(?:[0-9a-fA-F]{1}){4}|(?:[0-9a-fA-F]{2}){4})$/';
}