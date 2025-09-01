<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\Proposal\ProposalService;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;

class ProposalPublicControllerTest extends TestCase {

	protected IRequest|MockObject $request;
	protected ProposalService|MockObject $proposalService;
	protected ProposalPublicController $controller;

	protected function setUp(): void {
		parent::setUp();

		$this->request = $this->createMock(IRequest::class);
		$this->proposalService = $this->createMock(ProposalService::class);

		$this->controller = new ProposalPublicController(
			$this->request,
			$this->proposalService
		);
	}

	public function testIndex(): void {
		$token = 'test_token_123';

		/** @var TemplateResponse $response */
		$response = $this->controller->index($token);

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals('public', $response->getTemplateName());
		$this->assertEquals(TemplateResponse::RENDER_AS_PUBLIC, $response->getRenderAs());
	}

	public function testIndexWithEmptyToken(): void {
		$token = '';

		/** @var TemplateResponse $response */
		$response = $this->controller->index($token);

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals('public', $response->getTemplateName());
		$this->assertEquals(TemplateResponse::RENDER_AS_PUBLIC, $response->getRenderAs());
	}

}
