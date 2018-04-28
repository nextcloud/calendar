<?php
 namespace OCA\Calendar\Controller;

 use Exception;

 use OCP\IRequest;
 use OCP\AppFramework\Http;
 use OCP\AppFramework\Http\DataResponse;
 use OCP\AppFramework\Controller;


 class TestController extends Controller {
	
	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 */
     public function __construct($appName, IRequest $request){
         parent::__construct($appName, $request);
     }

	 /**
      * @NoAdminRequired
	  * @NoCSRFRequired
      */
	 public function test(){
		error_log("test route works",3,'/home/cmsc435/phplog.log');
		return new DataResponse([], Http::STATUS_NOT_FOUND);
	 }
 }