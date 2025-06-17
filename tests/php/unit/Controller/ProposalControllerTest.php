<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Objects\Proposal\ProposalObject;
use OCA\Calendar\Objects\Proposal\ProposalResponseObject;
use OCA\Calendar\Service\Proposal\ProposalService;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserManager;
use OCP\IUserSession;
use PHPUnit\Framework\MockObject\MockObject;

class ProposalControllerTest extends TestCase {

	protected IRequest|MockObject $request;
	protected IUserSession|MockObject $userSession;
	protected IUserManager|MockObject $userManager;
	protected IGroupManager|MockObject $groupManager;
	protected ProposalService|MockObject $proposalService;
	protected ProposalController $controller;
	protected IUser|MockObject $user;

	protected function setUp(): void {
		parent::setUp();

		$this->request = $this->createMock(IRequest::class);
		$this->userSession = $this->createMock(IUserSession::class);
		$this->userManager = $this->createMock(IUserManager::class);
		$this->groupManager = $this->createMock(IGroupManager::class);
		$this->proposalService = $this->createMock(ProposalService::class);
		$this->user = $this->createMock(IUser::class);

		$this->controller = new ProposalController(
			$this->request,
			$this->userSession,
			$this->userManager,
			$this->groupManager,
			$this->proposalService
		);
	}

	public function testListSuccess(): void {
		$proposals = [['id' => 1, 'title' => 'Test Proposal']];

		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('listProposals')
			->with($this->user)
			->willReturn($proposals);

		$response = $this->controller->list();

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals($proposals, $response->getData());
	}

	public function testListWithNoAuthentication(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(false);
		$this->proposalService->expects($this->never())
			->method('listProposals');

		$response = $this->controller->list();

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals(Http::STATUS_UNAUTHORIZED, $response->getStatus());
	}

	public function testListWithSpecificUser(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->exactly(2))
			->method('getUser')
			->willReturn($this->user);
		$this->user->expects($this->exactly(2))
			->method('getUID')
			->willReturn('regularuser');
		$this->groupManager->expects($this->once())
			->method('isAdmin')
			->with('regularuser')
			->willReturn(false);

		$response = $this->controller->list('anotheruser');

		$this->assertEquals(Http::STATUS_UNAUTHORIZED, $response->getStatus());
	}

	public function testListWithNonExistentUser(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->exactly(2))
			->method('getUser')
			->willReturn($this->user);
		$this->user->expects($this->exactly(2))
			->method('getUID')
			->willReturn('currentuser');
		$this->groupManager->expects($this->once())
			->method('isAdmin')
			->with('currentuser')
			->willReturn(false);
		// Note: userExists is never called because authorization fails first
		$this->userManager->expects($this->never())
			->method('userExists');

		$response = $this->controller->list('nonexistent');

		$this->assertEquals(Http::STATUS_UNAUTHORIZED, $response->getStatus());
	}

	public function testListWithNonExistentUserAsAdmin(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->exactly(2))
			->method('getUser')
			->willReturn($this->user);
		$this->user->expects($this->exactly(2))
			->method('getUID')
			->willReturn('admin');
		$this->groupManager->expects($this->once())
			->method('isAdmin')
			->with('admin')
			->willReturn(true);
		$this->userManager->expects($this->once())
			->method('userExists')
			->with('nonexistent')
			->willReturn(false);

		$response = $this->controller->list('nonexistent');

		$this->assertEquals(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$this->assertEquals(['error' => 'user not found'], $response->getData());
	}

	public function testListWithAdminAccess(): void {
		$proposals = [['id' => 3, 'title' => 'Admin Access Test']];
		$targetUser = $this->createMock(IUser::class);

		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->exactly(2))
			->method('getUser')
			->willReturn($this->user);
		$this->user->expects($this->exactly(2))
			->method('getUID')
			->willReturn('admin');
		$this->groupManager->expects($this->once())
			->method('isAdmin')
			->with('admin')
			->willReturn(true);
		$this->userManager->expects($this->once())
			->method('userExists')
			->with('targetuser')
			->willReturn(true);
		$this->userManager->expects($this->once())
			->method('get')
			->with('targetuser')
			->willReturn($targetUser);
		$this->proposalService->expects($this->once())
			->method('listProposals')
			->with($targetUser)
			->willReturn($proposals);

		$response = $this->controller->list('targetuser');

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals($proposals, $response->getData());
	}

	public function testFetchByTokenSuccess(): void {
		$proposal = $this->createMock(ProposalObject::class);
		$proposalUser = $this->createMock(IUser::class);

		$proposal->expects($this->once())
			->method('getUid')
			->willReturn('proposal_user_id');
		$proposal->expects($this->once())
			->method('setUname')
			->with('John Doe');
		$proposalUser->expects($this->once())
			->method('getDisplayName')
			->willReturn('John Doe');

		$this->proposalService->expects($this->once())
			->method('fetchByToken')
			->with('test_token')
			->willReturn($proposal);
		$this->userManager->expects($this->once())
			->method('get')
			->with('proposal_user_id')
			->willReturn($proposalUser);

		$response = $this->controller->fetchByToken('test_token');

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals($proposal, $response->getData());
	}

	public function testFetchByTokenNotFound(): void {
		$this->proposalService->expects($this->once())
			->method('fetchByToken')
			->with('invalid_token')
			->willReturn(null);

		$response = $this->controller->fetchByToken('invalid_token');

		$this->assertEquals(Http::STATUS_NOT_FOUND, $response->getStatus());
		$this->assertEquals(['error' => 'Proposal not found'], $response->getData());
	}

	public function testCreateSuccess(): void {
		$proposalData = ['title' => 'New Proposal', 'description' => 'Test'];
		$proposalObject = $this->createMock(ProposalObject::class);
		$createdProposal = $this->createMock(ProposalObject::class);

		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('createProposal')
			->with($this->user, $this->isInstanceOf(ProposalObject::class))
			->willReturn($createdProposal);

		$response = $this->controller->create($proposalData);

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals($createdProposal, $response->getData());
	}

	public function testModifySuccess(): void {
		$proposalData = ['id' => 1, 'title' => 'Modified Proposal'];
		$modifiedProposal = $this->createMock(ProposalObject::class);

		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('modifyProposal')
			->with($this->user, $this->isInstanceOf(ProposalObject::class))
			->willReturn($modifiedProposal);

		$response = $this->controller->modify($proposalData);

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals($modifiedProposal, $response->getData());
	}

	public function testModifyNotFound(): void {
		$proposalData = ['id' => 999, 'title' => 'Non-existent Proposal'];

		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('modifyProposal')
			->with($this->user, $this->isInstanceOf(ProposalObject::class))
			->willThrowException(new \InvalidArgumentException('Proposal not found'));

		$response = $this->controller->modify($proposalData);

		$this->assertEquals(Http::STATUS_NOT_FOUND, $response->getStatus());
		$this->assertEquals(['error' => 'Proposal not found'], $response->getData());
	}

	public function testDestroySuccess(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('destroyProposal')
			->with($this->user, 1);

		$response = $this->controller->destroy(1);

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals([], $response->getData());
	}

	public function testDestroyNotFound(): void {
		$this->userSession->expects($this->once())
			->method('isLoggedIn')
			->willReturn(true);
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($this->user);
		$this->proposalService->expects($this->once())
			->method('destroyProposal')
			->with($this->user, 999)
			->willThrowException(new \InvalidArgumentException('Not found'));

		$response = $this->controller->destroy(999);

		$this->assertEquals(Http::STATUS_NOT_FOUND, $response->getStatus());
		$this->assertEquals(['error' => 'Proposal not found'], $response->getData());
	}

	public function testResponseSuccess(): void {
		$responseData = ['proposal_id' => 1, 'response' => 'yes'];

		$this->proposalService->expects($this->once())
			->method('storeResponse')
			->with($this->isInstanceOf(ProposalResponseObject::class));

		$response = $this->controller->response($responseData);

		$this->assertEquals(Http::STATUS_OK, $response->getStatus());
		$this->assertEquals([], $response->getData());
	}

	public function testResponseException(): void {
		$responseData = ['invalid' => 'data'];

		$this->proposalService->expects($this->once())
			->method('storeResponse')
			->with($this->isInstanceOf(ProposalResponseObject::class))
			->willThrowException(new \Exception('Invalid response data'));

		$response = $this->controller->response($responseData);

		$this->assertEquals(Http::STATUS_INTERNAL_SERVER_ERROR, $response->getStatus());
		$this->assertEquals(['error' => 'Invalid response data'], $response->getData());
	}

}
