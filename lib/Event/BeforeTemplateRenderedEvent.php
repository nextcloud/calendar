<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2020 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Event;

use OCP\EventDispatcher\Event;

/**
 * Emitted before the rendering step of the public share page happens. The event
 * holds a flag that specifies if it is the authentication page of a public share.
 *
 * @since 20.0.0
 */
class BeforeTemplateRenderedEvent extends Event {

	/** @var bool */
	private $isPublic;

	/** @var bool */
	private $isEmbedded;

	/** @var string|null */
	private $tokens;

	/**
	 * @param bool $isPublic
	 * @param bool $isEmbedded
	 * @param string|null $tokens
	 *
	 * @since 20.0.0
	 */
	public function __construct(bool $isPublic, bool $isEmbedded, ?string $tokens) {
		parent::__construct();

		$this->isPublic = $isPublic;
		$this->isEmbedded = $isEmbedded;
		$this->tokens = $tokens;
	}

	/**
	 * @since 20.0.0
	 * @return bool
	 */
	public function isPublic(): bool {
		return $this->isPublic;
	}

	/**
	 * @since 20.0.0
	 * @return bool
	 */
	public function isEmbedded(): bool {
		return $this->isEmbedded;
	}

	/**
	 * @since 20.0.0
	 * @return string|null
	 */
	public function getTokens(): ?string {
		return $this->tokens;
	}
}
