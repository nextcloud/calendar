<?php
 namespace OCA\Calendar\Service;

 use Exception;

 use OCP\AppFramework\Http;
 use OCP\AppFramework\Db\DoesNotExistException;
 use OCP\AppFramework\Db\MultipleObjectsReturnedException;

 use OCA\Calendar\Db\OtoConfirmation;
 use OCA\Calendar\Db\OtoConfirmationMapper;
 
 class OtoConfirmationService {
	
	private $mapper;
	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param OtoConfirmationMapper $mapper the db mapper
	 */
     public function __construct(OtoConfirmationMapper $mapper){
		 $this->mapper = $mapper;
     }
	 /**
	 * @NoCSRFRequired
	 *
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if not found
     * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException if more than one result
	 * @param integer $otoLayerId
	 * @param string $password
	 */
	 public function getConfirmationsByUser($userId){
		$foo =  $this->mapper->getConfirmationsForUser($userId);
		return($foo);
	 }
	 
	 public function deleteConfirmationsByOtoLayer($otoLayerId){
		$this->mapper->deleteConfirmationsByOtoLayer($otoLayerId);
	 }
	 public function deleteBySourceId($sourceId,$userId){
		$this->mapper->deleteBySourceId($sourceId,$userId);
	 }
 }