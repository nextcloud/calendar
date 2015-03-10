<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus <thomas@tanghus.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Backend\WebCal;

use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;
use OCA\Calendar\Utility\RegexUtility;
use OCP\AppFramework\Http;
use OCA\Calendar\Backend\Exception as BackendException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\ISubscription;

class WebCal {

	/**
	 * @var string
	 */
	const IDENTIFIER = 'org.ownCloud.webcal';


	/**
	 * instance of subscription businesslayer
	 * @var \OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer
	 */
	protected $subscriptions;


	/**
	 * @param SubscriptionBusinessLayer $subscriptions
	 */
	public function __construct(SubscriptionBusinessLayer $subscriptions) {
		$this->subscriptions = $subscriptions;
	}


	/**
	 * prepare curl request
	 * @param resource $curl
	 * @param string $url
	 * @return resource $ch
	 */
	protected function prepareRequest(&$curl, $url) {
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($curl, CURLOPT_HEADER, true);
	}


	/**
	 * @param resource $curl
	 * @throws BackendException
	 * @throws CorruptDataException
	 */
	protected function validateRequest($curl) {
		$responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

		if (!$this->isSuccess($responseCode)) {
			if ($this->needsMove($responseCode)) {
				//TODO - update subscription with new url
			}

			if ($this->isClientSideError($responseCode)) {
				throw new BackendException('Client side error occurred', $responseCode);
			}

			if ($this->isServerSideError($responseCode)) {
				//file is temporarily not available
				throw new BackendException('Url temporarily not available');
			}
		}

		if (!$this->isContentTypeValid($contentType)) {
			throw new BackendException('URL doesn\'t contain valid calendar data', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @param resource $curl
	 * @param string &$data
	 */
	protected function getRequestData($curl, &$data) {
		$allData = curl_exec($curl);

		$headerLength = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
		$data = substr($allData, $headerLength);
	}


	/**
	 * @param string &$data
	 */
	protected function stripOfObjectData(&$data) {
		$data = preg_replace(RegexUtility::VEVENT, '', $data);
		$data = preg_replace(RegexUtility::VJOURNAL, '', $data);
		$data = preg_replace(RegexUtility::VTODO, '', $data);
		$data = preg_replace(RegexUtility::VFREEBUSY, '', $data);
	}


	/**
	 * validates a subscription's url
	 * @param ISubscription $subscription
	 * @throws \OCA\Calendar\Backend\Exception
	 */
	protected function validateSubscriptionUrl(ISubscription &$subscription) {
		$url = $subscription->getUrl();
		$parsed = parse_url($url);

		if (!$parsed) {
			throw new BackendException('URL not processable');
		}

		if (!isset($parsed['scheme'])) {
			//TODO - try to use https first
			$newUrl  = 'http://';
			$newUrl .= $url;

			$subscription->setUrl($newUrl);
			$parsed['scheme'] = 'http';
		}

		if ($parsed['scheme'] === 'webcal') {
			$newUrl = preg_replace("/^webcal:/i", "http:", $url);

			$subscription->setUrl($newUrl);
			$parsed['scheme'] = 'http';
		}

		if ($parsed['scheme'] !== 'http' && $parsed['scheme'] !== 'https') {
			throw new BackendException('Protocol not supported');
		}
	}


	/**
	 * @param string $contentType
	 * @return bool
	 */
	private function isContentTypeValid($contentType) {
		return (substr($contentType, 0, 13) === 'text/calendar');
	}


	/**
	 * @param int $responseCode
	 * @return bool
	 */
	private function isSuccess($responseCode) {
		return ($responseCode >= 200 && $responseCode <= 299);
	}


	/**
	 * @param int $responseCode
	 * @return bool
	 */
	private function needsMove($responseCode) {
		return ($responseCode === 301);
	}


	/**
	 * @param int $responseCode
	 * @return bool
	 */
	private function isClientSideError($responseCode) {
		return ($responseCode >= 400 && $responseCode <= 499);
	}


	/**
	 * @param int $responseCode
	 * @return bool
	 */
	private function isServerSideError($responseCode) {
		return ($responseCode >= 500 && $responseCode <= 599);
	}

}