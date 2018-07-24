<?php
 namespace OCA\Calendar\Controller;

 use Exception;

 use OCP\IRequest;
 use OCP\AppFramework\Http;
 use OCP\AppFramework\Http\DataResponse;
 use OCP\AppFramework\Controller;
 use OCA\Calendar\Db\OtoConfirmation;
 use OCA\Calendar\Db\OtoConfirmationMapper;
 use OCA\Calendar\Service\OtoLayerService;
 use OCA\Calendar\Service\OtoConfirmationService;
 use OCP\IUserSession;
 //using the IUserSession above lets us get info about the user
 
 class OtoConfirmationController extends Controller {
	
	private $mapper;
	private $foo;


	/**
     * @NoAdminRequired
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param OtoConfirmationMapper $mapper 
	 * @param OtoConfirmationService $otoConfirmationService
	 * @param OtoLayerService $otoLayerService
	 * @param IUserSession $userSession
	 */
	 public function __construct($appName, IRequest $request, OtoConfirmationMapper $mapper,OtoConfirmationService $otoConfirmationService, OtoLayerService $otoLayerService, IUserSession $userSession){
         parent::__construct($appName, $request);
		 $this->mapper = $mapper;
		 $this->otoLayerService = $otoLayerService;
		 $this->otoConfirmationService = $otoConfirmationService;
		 $this->userSession = $userSession;
		// $this->userId = $userSession->getUser()->getUID();
     } 
	 /**
      * @PublicPage
	  * @NoCSRFRequired
	  * @param string $otoLayerId
	  * @param string $password
	  * @param string $eventId
	  * @param string $name
	  * @param string $password
      */
	 public function create($otoLayerId, $password, $eventId, $name){
		 //check password first, refuse connection if not matching
		if(! $this->otoLayerService->passwordCheck($otoLayerId,$password) ){
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
		//check that we can still confirm this event, if not refuse the connection
		if(! $this->mapper->canConfirm($otoLayerId) ){
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
		$confirmation = new OtoConfirmation();
		//below log message is only present if we passed these tests
		$confirmation->setOtoLayerId($otoLayerId);
		$confirmation->setName($name);
		$confirmation->setEventId($eventId);
		//populate confirmation with relevant information
		try{
			$foo = new DataResponse($this->mapper->insert($confirmation));
			return $foo;
			//attempt to insert the confirmation, no log message if successful
		}catch(Exception $e){
			//catch exceptions and add them to our phplog for debugging or review
			return new DataResponse([], Http::STATUS_NOT_FOUND);
			//refuse the connection
		}
	 }
	 //returns a data response that contains all of the confirmations for a user 
	 //along with their otoLayer's sourceId and destinationId
	 /**
     * @NoAdminRequired
	 */
	 public function getConfirmationsByUser(){
		//user ID is passed in
		$userId = $this->userSession->getUser()->getUID();
		try{
			return new DataResponse($this->mapper->getConfirmationsByUser($userId));
		}catch(Exception $e){
			return new DataResponse([],Http::STATUS_NOT_FOUND);
		}
	 }
	 //deletes a layer and all of it's confirmations
	 /**
     * @NoAdminRequired
	 */
	 public function deleteConfirmationsLayers($otoLayerId){
		try{
			$this->otoConfirmationService->deleteConfirmationsByOtoLayer($otoLayerId);
			$this->otoLayerService->deleteLayer($otoLayerId);
			return new DataResponse(True);
		}catch(Exception $e){
			//catch any problems that might arise when deleting a layer
			return new DataResponse(False);
		}
	 }
	 //deletes a layer and all of it's confirmations
	 /**
     * @NoAdminRequired
	 */
	 public function deleteBySourceId($sourceId){
		try{
			$userId = $this->userSession->getUser()->getUID();
			$this->otoConfirmationService->deleteBySourceId($sourceId,$userId);
			$this->otoLayerService->deleteBySourceId($sourceId,$userId);
		return new DataResponse(True);
		}catch(Exception $e){
			//catch any problems that might arise when deleting a layer
			return new DataResponse(False);
		}
	 }
 }