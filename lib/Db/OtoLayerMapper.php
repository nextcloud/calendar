<?php
// db/otolayermapper.php

namespace OCA\Calendar\Db;

use OCP\IDBConnection;
use OCP\AppFramework\Db\Mapper;
use OCA\Calendar\Db\OtoLayer;

class OtoLayerMapper extends Mapper {

	protected $db;
	
    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'calendar_oto_layers','\OCA\Calendar\Db\OtoLayer');
		
		$this->db = $db;
    }


    /**
     * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
     * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
     */
    public function find($otoLayerId) {
        $sql = 'SELECT * FROM `*PREFIX*calendar_oto_layers` WHERE `oto_layer_id` = ?';
        return $this->findEntity($sql, [$otoLayerId]);
    }
	
	public function createGetId($layer){
		$returnLayer = $this -> insert($layer);
		$returnLayer->setOtoLayerId($this->db->lastInsertId());
		return $returnLayer;
	}
	/**
     * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
    */
    public function findUserLayers($userId) {
        $sql = 'SELECT * FROM `*PREFIX*calendar_oto_layers` WHERE `user_id` = ?';
        return $this->findEntities($sql, [$userId]);
    }
	
	public function passwordCheck($otoLayerId, $password){
		$sql = 'SELECT COUNT(*) AS `count` FROM `*PREFIX*calendar_oto_layers` ' .
            'WHERE `oto_layer_id` = ? AND `password` = ?';
        $stmt = $this->execute($sql, [$otoLayerId,$password]);

        $row = $stmt->fetch();
        $stmt->closeCursor();
        if( $row['count'] > 0 ){
			return true;
		}else{
			return false;
		}
	}
	//deletes all layers where otoLayerId = $otoLayerId
	public function deleteLayer($otoLayerId){
		$sql = 'DELETE FROM `*PREFIX*calendar_oto_layers` WHERE `oto_layer_id` = ?';
		$stmt = $this->db->prepare($sql);
		$stmt->bindParam(1,$otoLayerId, \PDO::PARAM_INT);
		$stmt -> execute();
	}
	//checks if a calendar layer is being used for scheduling
	public function isOtoLayer($sourceId){
		$sql = 'SELECT COUNT(*) AS `count` FROM `*PREFIX*calendar_oto_layers` ' .
            'WHERE `source_id` = ?';
        $stmt = $this->execute($sql, [$sourceId]);

        $row = $stmt->fetch();
        $stmt->closeCursor();
        if( $row['count'] > 0 ){
			return true;
		}else{
			return false;
		}
	}
	//deletes all layers with the given sourceId
	public function deleteBySourceId($sourceId,$userId){
		$sql = 'DELETE FROM `*PREFIX*calendar_oto_layers` WHERE `source_id` = ? AND `user_id` = ?';
		$stmt = $this->db->prepare($sql);
		$stmt->bindParam(1,$sourceId);
		$stmt->bindParam(2,$userId);
		$stmt -> execute();
	}
}