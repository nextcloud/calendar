<?php
namespace OCA\Calendar\Db;

use JsonSerializable;

use OCP\AppFramework\Db\Entity;

class Test extends Entity implements JsonSerializable {

    protected $user;
    protected $id;

    public function jsonSerialize() {
        return [
            'id' => $this->id,
            'user' => $this->user
        ];
    }
}