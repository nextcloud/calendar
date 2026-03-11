<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Dav;

use OCA\Calendar\Db\ShareAlarmSettingMapper;
use Sabre\CalDAV\ICalendarObject;
use Sabre\DAV\INode;
use Sabre\DAV\PropFind;
use Sabre\DAV\Server;
use Sabre\DAV\ServerPlugin;
use Sabre\HTTP\RequestInterface;
use Sabre\HTTP\ResponseInterface;
use Sabre\VObject\Reader;
use Psr\Log\LoggerInterface;

/**
 * SabreDAV plugin that strips VALARM components from CalDAV responses
 * for shared calendars where the owner has enabled alarm suppression.
 */
class StripAlarmsPlugin extends ServerPlugin {

	private ?Server $server = null;

	/** @var array<string, bool> In-memory cache for suppression lookups per request */
	private array $suppressionCache = [];

	public function __construct(
		private readonly ShareAlarmSettingMapper $mapper,
		private readonly LoggerInterface $logger,
	) {
	}

	/**
	 * Returns the plugin name
	 *
	 * @return string
	 */
	public function getPluginName(): string {
		return 'nc-calendar-strip-alarms';
	}

	/**
	 * Register event handlers on the SabreDAV server
	 *
	 * @param Server $server The SabreDAV server instance
	 */
	public function initialize(Server $server): void {
		$this->server = $server;
		// Priority 600: runs after CalDAV plugin's propFind handlers (150-550)
		// so that calendar-data is already populated
		$server->on('propFind', [$this, 'handlePropFind'], 600);
		// Handle direct GET requests on calendar objects
		$server->on('afterMethod:GET', [$this, 'handleAfterGet']);
	}

	/**
	 * Handle propFind events for REPORT responses (calendar-multiget, calendar-query)
	 *
	 * Checks if the calendar-data property contains VALARM components that
	 * should be stripped for this sharee, and removes them.
	 *
	 * @param PropFind $propFind The PropFind object
	 * @param INode $node The node being queried
	 */
	public function handlePropFind(PropFind $propFind, INode $node): void {
		if (!($node instanceof ICalendarObject)) {
			return;
		}

		if (!$this->shouldStripAlarms($node)) {
			return;
		}

		$calendarData = $propFind->get('{urn:ietf:params:xml:ns:caldav}calendar-data');
		if ($calendarData === null) {
			return;
		}

		$stripped = $this->stripVAlarms($calendarData);
		if ($stripped !== null) {
			$propFind->set('{urn:ietf:params:xml:ns:caldav}calendar-data', $stripped);
		}
	}

	/**
	 * Handle afterMethod:GET events for direct GET requests on calendar objects
	 *
	 * @param RequestInterface $request The HTTP request
	 * @param ResponseInterface $response The HTTP response
	 */
	public function handleAfterGet(RequestInterface $request, ResponseInterface $response): void {
		$path = $request->getPath();

		try {
			$node = $this->server->tree->getNodeForPath($path);
		} catch (\Exception) {
			return;
		}

		if (!($node instanceof ICalendarObject)) {
			return;
		}

		if (!$this->shouldStripAlarms($node)) {
			return;
		}

		$body = $response->getBodyAsString();
		if (empty($body)) {
			return;
		}

		$stripped = $this->stripVAlarms($body);
		if ($stripped !== null) {
			$response->setBody($stripped);
		}
	}

	/**
	 * Determine whether VALARM components should be stripped from this node
	 *
	 * Checks if the node belongs to a shared calendar where the owner
	 * has enabled alarm suppression for the current sharee.
	 *
	 * @param ICalendarObject $node The calendar object node
	 * @return bool True if alarms should be stripped
	 */
	private function shouldStripAlarms(ICalendarObject $node): bool {
		$calendarInfo = $this->getCalendarInfo($node);
		if ($calendarInfo === null) {
			return false;
		}

		$ownerPrincipal = $calendarInfo['{http://owncloud.org/ns}owner-principal'] ?? null;
		$principalUri = $calendarInfo['principaluri'] ?? null;

		// Not a shared calendar if owner matches current principal
		if ($ownerPrincipal === null || $principalUri === null || $ownerPrincipal === $principalUri) {
			return false;
		}

		$calendarId = $calendarInfo['id'] ?? null;
		if ($calendarId === null) {
			return false;
		}

		$cacheKey = $calendarId . ':' . $principalUri;
		if (isset($this->suppressionCache[$cacheKey])) {
			return $this->suppressionCache[$cacheKey];
		}

		$result = $this->mapper->isSuppressed((int)$calendarId, $principalUri);
		$this->suppressionCache[$cacheKey] = $result;
		return $result;
	}

	/**
	 * Extract calendarInfo from a CalendarObject node
	 *
	 * Tries direct method access first, then falls back to looking up
	 * the parent Calendar node from the server tree.
	 *
	 * @param ICalendarObject $node The calendar object node
	 * @return array|null The calendarInfo array, or null if unavailable
	 */
	private function getCalendarInfo(ICalendarObject $node): ?array {
		// Nextcloud's CalendarObject extends Sabre's CalendarObject which
		// stores calendarInfo as a protected property. Try reflection to
		// access it if no public method is available.
		if (method_exists($node, 'getCalendarInfo')) {
			return $node->getCalendarInfo();
		}

		// Fallback: use reflection to access the protected calendarInfo property
		try {
			$reflection = new \ReflectionClass($node);
			$property = $reflection->getProperty('calendarInfo');
			return $property->getValue($node);
		} catch (\ReflectionException) {
			// Reflection failed, try parent node lookup
		}

		// Last resort: look up the parent Calendar node from the server tree
		try {
			$path = $this->server->getRequestUri();
			$parentPath = dirname($path);
			$parent = $this->server->tree->getNodeForPath($parentPath);
			if (method_exists($parent, 'getCalendarInfo')) {
				return $parent->getCalendarInfo();
			}
		} catch (\Exception $e) {
			$this->logger->debug('Could not determine calendar info for alarm stripping', [
				'exception' => $e,
			]);
		}

		return null;
	}

	/**
	 * Strip all VALARM components from ICS data
	 *
	 * Follows the same pattern as CalendarObject::removeVAlarms() in the
	 * Nextcloud server's apps/dav/lib/CalDAV/CalendarObject.php.
	 *
	 * @param string $calendarData Raw ICS data
	 * @return string|null Modified ICS data with VALARMs removed, or null on error
	 */
	private function stripVAlarms(string $calendarData): ?string {
		try {
			$vObject = Reader::read($calendarData);
			$subcomponents = $vObject->getComponents();

			foreach ($subcomponents as $subcomponent) {
				unset($subcomponent->VALARM);
			}

			$result = $vObject->serialize();
			$vObject->destroy();
			return $result;
		} catch (\Exception $e) {
			$this->logger->warning('Failed to strip VALARM from calendar data', [
				'exception' => $e,
			]);
			return null;
		}
	}
}
