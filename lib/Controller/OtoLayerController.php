<?php
 namespace OCA\Calendar\Controller;

 use Exception;

 use OCP\IRequest;
 use OCP\IUserSession;
 use OCP\AppFramework\Http;
 use OCP\AppFramework\Http\DataResponse;
 use OCP\AppFramework\Controller;
 use OCP\AppFramework\Db\DoesNotExistException;
 use OCP\AppFramework\Db\MultipleObjectsReturnedException;

 use OCA\Calendar\Db\OtoLayer;
 use OCA\Calendar\Db\OtoLayerMapper;
 	

 
 class OtoLayerController extends Controller {
	//the param added for user session allows us to get the uid
	private $userSession;
	private $mapper;
	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param OtoLayerMapper $mapper the dbo mapper
	 * @param IUserSession $userSession
	 */
     public function __construct($appName, IRequest $request, OtoLayerMapper $mapper, IUserSession $userSession){
         parent::__construct($appName, $request);
		 
		$this->mapper = $mapper; 
		$this->userSession = $userSession;
		//$userSession has the user id we are looking for
     }
	  /**
      * 
	  * @CSRFRequired
	  *
	  * @param string $sourceId
	  * @param string $destId
      */
	 public function create($sourceId, $destId){
		$layer = new OtoLayer();
		//error log above ensures otos layer was created successfully
		$layer->setSourceId($sourceId);
		$layer->setDestId($destId);
		//next line gets user ID
		$uid = $this->userSession->getUser()->getUID();
		//stores it in a local variable uid to use in setUserId() for basic user verification 
		//the logs above are used for testing to ensure correct id has been retrieved
		//below we set layer to uid we retrieved
		$layer->setUserId($uid);
		//generate a password thats longer than 6 chars
		$layer->setPassword('');
		while( strlen($layer->getPassword()) < 6 ){
			$password = bin2hex(openssl_random_pseudo_bytes(16));
			$layer->setPassword($password);
			//converts password to url format
			$layer->slugify('password');
		}
		
		try{
			return new DataResponse($this->mapper->createGetId($layer));
		}catch(Exception $e){
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	 }
	 
	 public function deleteOtoLayer($otoLayerId){
		try{
			$this->mapper->deleteLayer($otoLayerId);
			return new DataResponse(True);
		}catch(Exception $e){
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	 }
	 
	 public function isSchedulingLayer($sourceId){
		try{
			$isSchedulingLayer = $this->mapper->isSchedulingLayer($sourceId);
			return new DataResponse($isSchedulingLayer);
		}catch (Exception $e){
			return new DataResponse(False);
		}
	}
	
	public function findUserLayers(){
		$userId = $this->userSession->getUser()->getUID();
		try{
			return new DataResponse($this->mapper->findUserLayers($userId));
		}catch(Exception $e){
			return new DataResponse([], Http::STATUS_NOT_FOUND);
		}
	}
 }