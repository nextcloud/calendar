<?php
// db/authormapper.php

namespace OCA\Calendar\Db;

use OCP\IDBConnection;
use OCP\AppFramework\Db\Mapper;

class TestMapper extends Mapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'calendar_test','\OCA\Calendar\Db\Test');
    }


    /**
     * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
     * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
     */
    public function find($id) {
		error_log("mapper called",3,'/home/cmsc435/phplog.log');
        $sql = 'SELECT * FROM `*PREFIX*calendar_test` WHERE `id` = ?';
        return $this->findEntity($sql, [$id]);
    }
}