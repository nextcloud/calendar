<?php
namespace OCA\Calendar\Db;

use JsonSerializable;

use OCP\AppFramework\Db\Entity;

class OtoLayer extends Entity implements JsonSerializable {

	public $otoLayerId;
    public $sourceId;
	public $destId;
	public $userId;
	public $password;
	

    public function jsonSerialize() {
        return [
            'otoLayerId' => $this->otoLayerId,
            'sourceId' => $this->sourceId,
			'destId' => $this->destId,
			'userId'=>  $this->userId,
			'password'=> $this->password
        ];
    }
}