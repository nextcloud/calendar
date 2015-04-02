<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Bart Visscher
 * @copyright 2014 Bart Visscher <bartv@thisnet.nl>
 * @author Jakob Sack
 * @copyright 2014 Jakob Sack <mail@jakobsack.de>
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
namespace OCA\Calendar\Backend\Local;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\ISubscription;
use OCP\IL10N;

class Backend implements BackendUtils\IBackendAPI {

	/**
	 * @var IL10N
	 */
	protected $l10n;


	/**
	 * @param IL10N $l10n
	 */
	public function __construct(IL10N $l10n) {
		$this->l10n = $l10n;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canBeEnabled() {
		return true;
	}


	/**
	 * {@inheritDoc}
	 */
	public function getSubscriptionTypes() {
		return [];
	}


	/**
	 * {@inheritDoc}
	 */
	public function validateSubscription(ISubscription $subscription) {
		throw new BackendUtils\SubscriptionInvalidException('Subscription is not supported');
	}


	/**
	 * {@inheritDoc}
	 */
	public function getAvailablePrefixes() {
		return [
			[
				'name' => strval($this->l10n->t('this ownCloud')),
				'prefix' => '',
			],
		];
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreColor() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreComponents() {
		return true;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreDescription() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreDisplayname() {
		return true;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreEnabled() {
		return true;
	}


	/**
	 * {@inheritDoc}
	 */
	public function canStoreOrder() {
		return true;
	}
}