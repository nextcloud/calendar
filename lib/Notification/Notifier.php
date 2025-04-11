<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Notification;

use OCA\Calendar\AppInfo\Application;
use OCP\IURLGenerator;
use OCP\L10N\IFactory;
use OCP\Notification\INotification;
use OCP\Notification\INotifier;
use OCP\Notification\UnknownNotificationException;

class Notifier implements INotifier {
	private IFactory $factory;
	private IURLGenerator $url;

	public function __construct(IFactory $factory,
		IURLGenerator $url) {
		$this->factory = $factory;
		$this->url = $url;
	}

	#[\Override]
	public function getID(): string {
		return Application::APP_ID;
	}

	/**
	 * Human-readable name describing the notifier
	 * @return string
	 */
	#[\Override]
	public function getName(): string {
		return $this->factory->get(Application::APP_ID)->t('Calendar');
	}


	#[\Override]
	public function prepare(INotification $notification, string $languageCode): INotification {
		if ($notification->getApp() !== Application::APP_ID) {
			// Not my app => throw
			throw new UnknownNotificationException();
		}

		// Read the language from the notification
		$l = $this->factory->get(Application::APP_ID, $languageCode);

		switch ($notification->getSubject()) {
			// Deal with known subjects
			case 'booking_accepted':
				$parameters = $notification->getSubjectParameters();
				$notification->setRichSubject($l->t('New booking {booking}'), [
					'booking' => [
						'id' => $parameters['id'],
						'type' => $parameters['type'],
						'name' => $parameters['name'],
						'link' => $this->url->linkToRouteAbsolute('calendar.view.index')
					]
				]);

				$messageParameters = $notification->getMessageParameters();
				$notification->setRichMessage($l->t('{display_name} ({email}) booked the appointment "{config_display_name}" on {date_time}.'), [
					'display_name' => [
						'type' => 'highlight',
						'id' => $messageParameters['id'],
						'name' => $messageParameters['display_name'],
					],
					'email' => [
						'type' => 'highlight',
						'id' => $messageParameters['id'],
						'name' => $messageParameters['email'],
					],
					'date_time' => [
						'type' => 'highlight',
						'id' => $messageParameters['id'],
						'name' => $messageParameters['date_time'],
					],
					'config_display_name' => [
						'type' => 'highlight',
						'id' => $messageParameters['id'],
						'name' => $messageParameters['config_display_name'],
					]
				]);
				break;
			default:
				throw  new UnknownNotificationException();
		}

		return $notification;
	}
}
