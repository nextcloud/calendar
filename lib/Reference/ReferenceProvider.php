<?php

declare(strict_types=1);

/*
 * @copyright 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 *
 * @author 2024 Hamza Mahjoubi <hamza.mahjoubi221@proton.me>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Reference;

use OCA\Calendar\AppInfo\Application;
use OCP\Collaboration\Reference\ADiscoverableReferenceProvider;
use OCP\Collaboration\Reference\IReference;

use OCP\Collaboration\Reference\Reference;
use OCP\IL10N;
use OCP\IURLGenerator;

class ReferenceProvider extends ADiscoverableReferenceProvider {


	public function __construct(
		private IL10N $l10n,
		private IURLGenerator $urlGenerator,
	) {
	}


	public function getId(): string {
		return 'calendar';
	}

	/**
	 * @inheritDoc
	 */
	public function getTitle(): string {
		return 'Calendar';
	}

	/**
	 * @inheritDoc
	 */
	public function getOrder(): int {
		return 20;
	}

	/**
	 * @inheritDoc
	 */
	public function getIconUrl(): string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath(Application::APP_ID, 'calendar-dark.svg')
		);
	}

	public function matchReference(string $referenceText): bool {
		$start = $this->urlGenerator->getAbsoluteURL('/apps/' . Application::APP_ID);
		$startIndex = $this->urlGenerator->getAbsoluteURL('/index.php/apps/' . Application::APP_ID);

		return preg_match('/^' . preg_quote($start, '/') . '\/p\/[a-zA-Z0-9]+$/i', $referenceText) === 1 || preg_match('/^' . preg_quote($startIndex, '/') . '\/p\/[a-zA-Z0-9]+$/i', $referenceText) === 1;
	}

	public function resolveReference(string $referenceText): ?IReference {
		if ($this->matchReference($referenceText)) {
			$token = $this->getCalendarTokenFromLink($referenceText);

			$reference = new Reference($referenceText);
			$reference->setTitle('calendar');
			$reference->setDescription($token);
			$reference->setRichObject(
				'calendar_widget',
				[
					'title' => 'calendar',
					'token' => $token,
					'url' => $referenceText,]
			);

			return $reference;
		}

		return null;
	}

	private function getCalendarTokenFromLink(string $url): ?string {


		if (preg_match('/\/p\/([a-zA-Z0-9]+)/', $url, $output_array)) {
			return $output_array[1];
		}
		return $url;

	}

	public function getCachePrefix(string $referenceId): string {
		return '';
	}

	/**
	 * @inheritDoc
	 */
	public function getCacheKey(string $referenceId): ?string {
		return $referenceId;
	}
}
