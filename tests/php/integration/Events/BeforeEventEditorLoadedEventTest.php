<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Events;

use ChristophWurst\Nextcloud\Testing\DatabaseTransaction;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Controller\PublicViewController;
use OCA\Calendar\Controller\ViewController;
use OCA\Calendar\Listener\AppMenuActionListener;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IUserManager;
use OCP\IUserSession;
use OCP\Server;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Symfony\Component\Uid\Uuid;

/**
 * Each test simulates a single request, so every test needs a fresh server
 */
#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
class BeforeEventEditorLoadedEventTest extends TestCase {
	use DatabaseTransaction;

	private IEventDispatcher $eventDispatcher;
	private int $dispatchCount = 0;

	protected function setUp(): void {
		parent::setUp();

		$this->eventDispatcher = Server::get(IEventDispatcher::class);
		$this->eventDispatcher->addListener(BeforeEventEditorLoadedEvent::class, function (): void {
			$this->dispatchCount++;
		});
	}

	public function testCalendarPageDispatchesOnce(): void {
		$this->logIn();

		$this->render(Server::get(ViewController::class)->index());

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testProposalPageDispatchesOnce(): void {
		$this->logIn();

		$this->render(Server::get(ViewController::class)->view('1'));

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testPublicPageDispatchesOnceForGuests(): void {
		$response = Server::get(PublicViewController::class)->publicIndexWithBranding('token');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->render($response);
		$this->assertSame(1, $this->dispatchCount);
	}

	public function testPublicPageDispatchesOnceForUsers(): void {
		$this->logIn();

		$response = Server::get(PublicViewController::class)->publicIndexWithBranding('token');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->render($response);
		$this->assertSame(1, $this->dispatchCount);
	}

	public function testEmbeddedPageDispatchesOnceForGuests(): void {
		$this->render(Server::get(PublicViewController::class)->publicIndexForEmbedding('token'));

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testEmbeddedPageDispatchesOnceForUsers(): void {
		$this->logIn();

		$this->render(Server::get(PublicViewController::class)->publicIndexForEmbedding('token'));

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testPageWithReferencesDispatchesOnceForGuests(): void {
		$this->eventDispatcher->dispatchTyped(new RenderReferenceEvent());
		$this->render(new TemplateResponse('core', 'test'));

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testPageWithReferencesDispatchesOnceForUsers(): void {
		$this->logIn();

		$this->eventDispatcher->dispatchTyped(new RenderReferenceEvent());
		$this->render(new TemplateResponse('core', 'test'));

		$this->assertSame(1, $this->dispatchCount);
	}

	public function testOtherPageDispatchesOnceForUsersWithAppMenuActions(): void {
		$this->logIn();

		$this->render(new TemplateResponse('core', 'test'));

		$this->assertSame(AppMenuActionListener::supportsAppMenuActions() ? 1 : 0, $this->dispatchCount);
	}

	private function logIn(): void {
		$user = Server::get(IUserManager::class)->createUser('user_' . Uuid::v4()->toBase58(), 'topsecretpassword');
		Server::get(IUserSession::class)->setUser($user);
	}

	/**
	 * Dispatches what the app framework dispatches when rendering a template response
	 */
	private function render(TemplateResponse $response): void {
		$isLoggedIn = Server::get(IUserSession::class)->isLoggedIn();
		$this->eventDispatcher->dispatchTyped(new BeforeTemplateRenderedEvent($isLoggedIn, $response));
	}
}
