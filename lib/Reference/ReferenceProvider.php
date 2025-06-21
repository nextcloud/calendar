<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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


	#[\Override]
	public function getId(): string {
		return 'calendar';
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getTitle(): string {
		return 'Calendar';
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getOrder(): int {
		return 20;
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getIconUrl(): string {
		return $this->urlGenerator->getAbsoluteURL(
			$this->urlGenerator->imagePath(Application::APP_ID, 'calendar-dark.svg')
		);
	}

	#[\Override]
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

	#[\Override]
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
			return $this->urlGenerator->getWebroot() . $output_array[0];
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

	#[\Override]
	public function getCachePrefix(string $referenceId): string {
		return '';
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function getCacheKey(string $referenceId): ?string {
		return $referenceId;
	}
}
