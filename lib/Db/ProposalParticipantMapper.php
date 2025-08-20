<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Db;

use OCP\AppFramework\Db\QBMapper;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

/**
 * @template-extends QBMapper<ProposalParticipantEntry>
 */
class ProposalParticipantMapper extends QBMapper {

	public function __construct(
		IDBConnection $db,
	) {
		$this->tableName = 'calendar_proposal_pts';
		parent::__construct($db, $this->tableName, ProposalParticipantEntry::class);
	}

	public function fetchByProposalId(string $userId, int $proposalId): array {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('pid', $qb->createNamedParameter($proposalId, IQueryBuilder::PARAM_INT))
			);
		return $this->findEntities($qb);
	}

	public function fetchByUserId(string $userId): array {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR))
			);
		return $this->findEntities($qb);
	}

	public function fetchByToken(string $token): ?ProposalParticipantEntry {
		$qb = $this->db->getQueryBuilder();
		$qb->select('*')
			->from($this->tableName)
			->where(
				$qb->expr()->eq('token', $qb->createNamedParameter($token, IQueryBuilder::PARAM_STR))
			);
		$result = $this->findEntity($qb);
		return $result;
	}

	public function deleteById(string $userId, int $id): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('id', $qb->createNamedParameter($id, IQueryBuilder::PARAM_INT))
			);
		$qb->executeStatement();
	}

	public function deleteByProposalId(string $userId, int $proposalId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('pid', $qb->createNamedParameter($proposalId, IQueryBuilder::PARAM_INT))
			);
		$qb->executeStatement();
	}

	public function deleteByUserId(string $userId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR))
			);
		$qb->executeStatement();
	}

}
