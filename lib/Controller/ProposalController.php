<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Objects\Proposal\ProposalObject;
use OCA\Calendar\Objects\Proposal\ProposalResponseObject;
use OCA\Calendar\Service\Proposal\ProposalService;
use OCP\AppFramework\ApiController;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\AnonRateLimit;
use OCP\AppFramework\Http\Attribute\ApiRoute;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\Attribute\UserRateLimit;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IUser;
use OCP\IUserManager;
use OCP\IUserSession;

class ProposalController extends ApiController {

	public function __construct(
		IRequest $request,
		private IUserSession $userSession,
		private IUserManager $userManager,
		private IGroupManager $groupManager,
		private ProposalService $proposalService,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	private function authorize(?string $userId = null): JSONResponse|IUser {
		// evaluate if user is logged in and has permissions
		if (!$this->userSession->isLoggedIn()) {
			return new JSONResponse([], Http::STATUS_UNAUTHORIZED);
		}
		if ($userId !== null) {
			if ($this->userSession->getUser()->getUID() !== $userId
				&& $this->groupManager->isAdmin($this->userSession->getUser()->getUID()) === false) {
				return new JSONResponse([], Http::STATUS_UNAUTHORIZED);
			}
			if (!$this->userManager->userExists($userId)) {
				return new JSONResponse(['error' => 'user not found'], Http::STATUS_BAD_REQUEST);
			}
			$user = $this->userManager->get($userId);
		} else {
			$user = $this->userSession->getUser();
		}
		if ($user === null) {
			return new JSONResponse(['error' => 'user not found'], Http::STATUS_BAD_REQUEST);
		}
		return $user;
	}

	/**
	 * Retrieve list of available proposals
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/list', root: '/calendar')]
	#[NoAdminRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function list(?string $user = null): JSONResponse {
		// authorize request
		$authorization = $this->authorize($user);
		if ($authorization instanceof JSONResponse) {
			return $authorization;
		}
		$userObject = $authorization;
		// retrieve proposals for the user
		$proposals = $this->proposalService->listProposals($userObject);

		return new JSONResponse($proposals, Http::STATUS_OK);
	}

	/**
	 * Fetch a proposal by its token
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/fetch', root: '/calendar')]
	#[PublicPage]
	#[NoCSRFRequired]
	#[NoAdminRequired]
	#[AnonRateLimit(limit: 10, period: 300)]
	#[UserRateLimit(limit: 10, period: 300)]
	public function fetchByToken(string $token): JSONResponse {
		$proposal = $this->proposalService->fetchByToken($token);
		if ($proposal === null) {
			return new JSONResponse(['error' => 'Proposal not found'], HTTP::STATUS_NOT_FOUND);
		}
		// enrich proposal with user information
		// as this is most likely a public request from the voting page
		$user = $this->userManager->get($proposal->getUid());
		if ($user !== null) {
			$proposal->setUname($user->getDisplayName());
		}
		return new JSONResponse($proposal, Http::STATUS_OK);
	}

	/**
	 * Create a new proposal
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/create', root: '/calendar')]
	#[NoAdminRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function create(array $proposal, ?string $user = null): JSONResponse {
		// authorize request
		$authorization = $this->authorize($user);
		if ($authorization instanceof JSONResponse) {
			return $authorization;
		}
		$userObject = $authorization;
		// construct proposal object from the provided data
		$proposalObject = new ProposalObject();
		$proposalObject->fromJson($proposal);
		// handle the creation of the proposal
		$proposalObject = $this->proposalService->createProposal($userObject, $proposalObject);

		return new JSONResponse($proposalObject, Http::STATUS_OK);
	}

	/**
	 * Modify a proposal
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/modify', root: '/calendar')]
	#[NoAdminRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function modify(array $proposal, ?string $user = null): JSONResponse {
		// authorize request
		$authorization = $this->authorize($user);
		if ($authorization instanceof JSONResponse) {
			return $authorization;
		}
		$userObject = $authorization;
		// construct proposal object from the provided data
		$proposalObject = new ProposalObject();
		$proposalObject->fromJson($proposal);
		// handle the modification of the proposal
		try {
			$proposalObject = $this->proposalService->modifyProposal($userObject, $proposalObject);
		} catch (\InvalidArgumentException $e) {
			return new JSONResponse(['error' => $e->getMessage()], Http::STATUS_NOT_FOUND);
		}

		return new JSONResponse($proposalObject, Http::STATUS_OK);
	}

	/**
	 * Destroy a proposal
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/destroy', root: '/calendar')]
	#[NoAdminRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function destroy(int $id, ?string $user = null): JSONResponse {
		// authorize request
		$authorization = $this->authorize($user);
		if ($authorization instanceof JSONResponse) {
			return $authorization;
		}
		$userObject = $authorization;
		// handle the destruction of the proposal
		try {
			$this->proposalService->destroyProposal($userObject, $id);
		} catch (\InvalidArgumentException $e) {
			return new JSONResponse(['error' => 'Proposal not found'], Http::STATUS_NOT_FOUND);
		}

		return new JSONResponse([], Http::STATUS_OK);
	}

	/**
	 * Convert a proposed date to a meeting
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/convert', root: '/calendar')]
	#[NoAdminRequired]
	#[UserRateLimit(limit: 10, period: 60)]
	public function convert(int $proposalId, int $dateId, array $options = [], ?string $user = null): JSONResponse {
		// authorize request
		$authorization = $this->authorize($user);
		if ($authorization instanceof JSONResponse) {
			return $authorization;
		}
		$userObject = $authorization;
		// handle the conversion
		try {
			$this->proposalService->convertProposal($userObject, $proposalId, $dateId, $options);
		} catch (\InvalidArgumentException $e) {
			return new JSONResponse(['error' => $e->getMessage()], Http::STATUS_NOT_FOUND);
		}

		return new JSONResponse([], Http::STATUS_OK);
	}

	/**
	 * Public view proposal response/vote
	 */
	#[ApiRoute(verb: 'POST', url: '/proposal/response', root: '/calendar')]
	#[PublicPage]
	#[NoCSRFRequired]
	#[NoAdminRequired]
	#[AnonRateLimit(limit: 10, period: 300)]
	#[UserRateLimit(limit: 10, period: 300)]
	public function response(array $response): JSONResponse {
		try {
			// construct proposal response object from the provided data
			$proposalResponse = new ProposalResponseObject();
			$proposalResponse->fromJson($response);
			// handle the response
			$this->proposalService->storeResponse($proposalResponse);
			return new JSONResponse([], Http::STATUS_OK);
		} catch (\Exception $e) {
			return new JSONResponse(['error' => $e->getMessage()], Http::STATUS_INTERNAL_SERVER_ERROR);
		}
	}

}
