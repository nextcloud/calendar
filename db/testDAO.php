<?php
// db/authordao.php

namespace OCA\Calendar\Db;

use OCP\IDBConnection;

class testDAO {

    private $db;

    public function __construct(IDBConnection $db) {
        $this->db = $db;
    }

    public function find($id) {
		error_log("DAO works",3,'/home/cmsc435/phplog.log');
        $sql = 'SELECT * FROM `*PREFIX*calendar_test` ' .
            'WHERE `id` = ?';
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(1, $id, \PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        $stmt->closeCursor();
        return $row;
    }

}
?>
