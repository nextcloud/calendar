<?php
 namespace OCA\Calendar\Service;

 use Exception;

 use OCP\AppFramework\Http;
 use OCP\AppFramework\Db\DoesNotExistException;
 use OCP\AppFramework\Db\MultipleObjectsReturnedException;

 use OCA\Calendar\Db\OtoLayer;
 use OCA\Calendar\Db\OtoLayerMapper;
 
 class OtoLayerService {
	
	private $mapper;
	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param OtoLayerMapper $mapper the dbo mapper
	 */
     public function __construct(OtoLayerMapper $mapper){
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
	 public function passwordCheck($otoLayerId, $password){
		$isVerified = $this->mapper->passwordCheck($otoLayerId, $password);
		return $isVerified;
	 }
	 
	 public function deleteLayer($otoLayerId){
		$this->mapper->deleteLayer($otoLayerId);
	 }
	 
	 public function deleteBySourceId($sourceId,$userId){
		$this->mapper->deleteBySourceId($sourceId,$userId);
	 }
	 
	 public function findUserLayers($userId){
		$this->mapper->findUserLayers($userId);
	 }
 }