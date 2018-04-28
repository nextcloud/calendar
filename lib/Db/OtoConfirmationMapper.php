<?php
// db/otoconfirmationmapper.php

namespace OCA\Calendar\Db;

use OCP\IDBConnection;
use OCP\AppFramework\Db\Mapper;

class OtoConfirmationMapper extends Mapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'calendar_oto_confirmations','\OCA\Calendar\Db\OtoConfirmation');
    }


    /**
     * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
     * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
     */
    public function find($otoConfirmationId) {
        $sql = 'SELECT * FROM `*PREFIX*calendar_oto_confirmations` WHERE `otoConfirmationId` = ?';
        return $this->findEntity($sql, [$otoConfirmationId]);
    }
	
	public function getConfirmationsByUser($userId){
		$sql = 'SELECT `t1`.`oto_confirmation_id`, `t1`.`oto_layer_id`, `t1`.`name`, `t1`.`event_id`, `t2`.`source_id`, `t2`.`dest_id` FROM `*PREFIX*calendar_oto_confirmations` AS `t1` ' .
		'INNER JOIN `*PREFIX*calendar_oto_layers` as `t2` ON `t1`.`oto_layer_id` = `t2`.`oto_layer_id` ' .
		'WHERE `t2`.`user_id` = ?';
        return $this->findEntities($sql, [$userId]);
	}
	
	public function canConfirm($otoLayerId){
		$sql = 'SELECT COUNT(*) as `count` FROM `*PREFIX*calendar_oto_confirmations` AS `t1` ' .
		'INNER JOIN `*PREFIX*calendar_oto_layers` as `t2` ON `t1`.`oto_layer_id` = `t2`.`oto_layer_id` ' .
		'WHERE `t2`.`oto_layer_id` = ?';
		$stmt = $this->execute($sql, [$otoLayerId]);

        $row = $stmt->fetch();
        $stmt->closeCursor();
        if( $row['count'] > 0 ){
			return false;
		}else{
			return true;
		}
	}
	//deletes all confirmations where otoLayerId = $otoLayerId
	public function deleteConfirmationsByOtoLayer($otoLayerId){
		$sql = 'DELETE FROM `*PREFIX*calendar_oto_confirmations` WHERE `oto_layer_id` = ?';
		$stmt = $this->db->prepare($sql);
		$stmt->bindParam(1,$otoLayerId, \PDO::PARAM_INT);
		$stmt -> execute();
	}
	//deletes all confirmations with the given sourceId
	public function deleteBySourceId($sourceId,$userId){
		$sql = 'DELETE `t1` FROM `*PREFIX*calendar_oto_confirmations` AS `t1` ' .
		'INNER JOIN `*PREFIX*calendar_oto_layers` AS `t2` ON `t1`.`oto_layer_id` = `t2`.`oto_layer_id` ' .
		'WHERE `source_id` = ? AND `t2`.`user_id` = ?';
		$stmt = $this->db->prepare($sql);
		$stmt->bindParam(1,$sourceId, \PDO::PARAM_INT);
		$stmt->bindParam(2,$userId, \PDO::PARAM_STR);
		$stmt -> execute();
	}
}