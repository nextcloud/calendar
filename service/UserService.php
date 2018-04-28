<?php
namespace OCA\Calendar\Service;

class UserService {

    private $userManager;

    public function __construct($userManager){
        $this->userManager = $userManager;
    }

    public function create($userId, $password) {
        return $this->userManager->create($userId, $password);
    }

}