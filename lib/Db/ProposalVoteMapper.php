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
 * @template-extends QBMapper<ProposalVoteEntry>
 */
class ProposalVoteMapper extends QBMapper {

	public function __construct(
		IDBConnection $db,
	) {
		$this->tableName = 'calendar_proposal_vts';
		parent::__construct($db, $this->tableName, ProposalVoteEntry::class);
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

	public function deleteByProposalId(string $userId, int $proposalId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('pid', $qb->createNamedParameter($proposalId, IQueryBuilder::PARAM_INT))
			);
		$qb->executeStatement();
	}

	public function deleteByDateId(string $userId, int $dateId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('date_id', $qb->createNamedParameter($dateId, IQueryBuilder::PARAM_INT))
			);
		$qb->executeStatement();
	}

	public function deleteByParticipantId(string $userId, int $participantId): void {
		$qb = $this->db->getQueryBuilder();
		$qb->delete($this->tableName)
			->where(
				$qb->expr()->eq('uid', $qb->createNamedParameter($userId, IQueryBuilder::PARAM_STR)),
				$qb->expr()->eq('participant_id', $qb->createNamedParameter($participantId, IQueryBuilder::PARAM_INT))
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
