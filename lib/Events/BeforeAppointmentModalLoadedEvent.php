<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Events;

use OCP\EventDispatcher\Event;

/**
 * This event is triggered whenever the appointment configuration modal is loaded.
 * Used to load relevant integrations.
 *
 * @since 6.7.0
 */
final class BeforeAppointmentModalLoadedEvent extends Event {
}
