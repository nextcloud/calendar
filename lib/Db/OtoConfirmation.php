<?php
namespace OCA\Calendar\Db;

use JsonSerializable;

use OCP\AppFramework\Db\Entity;

class OtoConfirmation extends Entity implements JsonSerializable {

	public $otoConfirmationId;
    public $otoLayerId;
	public $name;
	public $eventId;
	public $sourceId;
	public $destId;
	

    public function jsonSerialize() {
        return [
            'otoConfirmationId' => $this->otoConfirmationId,
            'otoLayerId' => $this->otoLayerId,
			'name' => $this->name,
			'eventId' =>  $this->eventId,
			'sourceId' => $this->sourceId,
			'destId' => $this->destId
        ];
    }
}