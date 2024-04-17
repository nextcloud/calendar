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
		if (preg_match('/^' . preg_quote($start, '/') . '\/p\/[a-zA-Z0-9]+$/i', $referenceText) === 1 || preg_match('/^' . preg_quote($startIndex, '/') . '\/p\/[a-zA-Z0-9]+$/i', $referenceText) === 1) {
			return true;
		}
		
		$start = $this->urlGenerator->getAbsoluteURL('/remote.php/dav/calendars');
		if (preg_match('/^' . preg_quote($start, '/') . '\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/$/i', $referenceText) === 1) {
			return true;
		}

		return false;
	}

	public function resolveReference(string $referenceText): ?IReference {
		if ($this->matchReference($referenceText)) {
			$type = $this->getType($referenceText);
			$reference = new Reference($referenceText);
			$reference->setTitle('calendar');
			$reference->setDescription('calendar widget');

			switch ($type) {
				case 'public':
					$token = $this->getCalendarTokenFromLink($referenceText);
					$url = $this->getUrlFromLink($token, 'public');
					$reference->setRichObject(
						'calendar_widget',
						[
							'title' => 'calendar',
							'token' => $token,
							'isPublic' => true,
							'url' => $url,
						]
					);
					break;
				case 'private':
					$url = $this->getUrlFromLink($referenceText, 'private');
					$reference->setRichObject(
						'calendar_widget',
						[
							'title' => 'calendar',
							'isPublic' => false,
							'url' => $url,
						]
					);
					break;
				default:
					return null;
			}

		

			return $reference;
		}

		return null;
	}

	private function getCalendarTokenFromLink(string $url): ?string {
		if (preg_match('/\/p\/([a-zA-Z0-9]+)/', $url, $output_array)) {
			return $output_array[1];
		}
		return null;

	}
	private function getUrlFromLink(string $data, string $type): ?string {
		if ($type === 'public') {
			return "{$this->urlGenerator->getWebroot()}/remote.php/dav/public-calendars/{$data}/";
		} elseif ($type === 'private' && preg_match('/\/remote.php\/dav\/calendars\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\//', $data, $output_array)) {
			return $this->urlGenerator->getWebroot().$output_array[0];
		}
		return null;

	}

	private function getType(string $url): string {
		if (preg_match('/\/p\/([a-zA-Z0-9]+)/', $url) === 1) {
			return 'public';
		}
		if (preg_match('/\/dav\/calendars\/([^\/]+)\/([^\/]+)/', $url) === 1) {
			return 'private';
		}
		return 'unknown';
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
