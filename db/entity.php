<?php
/**
 * Copyright (c) 2014 Bernhard Posselt <dev@bernhard-posselt.com>
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCA\Calendar\Utility\Utility;
use OCP\Calendar\IEntity;

abstract class Entity extends \OCP\AppFramework\Db\Entity implements IEntity {

	/**
	 * fields that are mandatory for a valid Entity
	 * @var array
	 */
	private $_mandatory = [];


	/**
	 * fields that need to be instance of a certain class/interface
	 */
	private $_advancedFieldTypes = [];


	/**
	 * Constructor
	 */
	public function __construct() {
		if (method_exists($this, 'registerTypes')) {
			$this->registerTypes();
		}
		if (method_exists($this, 'registerMandatory')) {
			$this->registerMandatory();
		}
	}


	/**
	 * @param integer $id
	 * @return $this
	 */
	public function setId($id) {
		return $this->setter('id', array($id));
	}


	/**
	 * @return integer
	 */
	public function getId() {
		return $this->getter('id');
	}


	/**
	 * overwrite current object with properties from $object that are not null
	 * Does not affect Id property
	 *
	 * @param IEntity $entity
	 * @return $this
	 */
	public function overwriteWith(IEntity $entity) {
		$properties = Utility::getPublicProperties($this);
		unset($properties['id']);

		foreach($properties as $key => $oldValue) {
			$getter = 'get' . ucfirst($key);

			$newValue = $entity->$getter();
			if ($newValue !== null && $newValue !== $oldValue) {
				$this->setter($key, array($newValue));
			}
		}

		return $this;
	}


	/**
	 * checks if current object contains null values
	 *
	 * @return boolean
	 */
	public function doesContainNullValues() {
		return in_array(
			null,
			Utility::getPublicProperties($this)
		);
	}



	/**
	 * @param string $name
	 * @param mixed $args
	 * @return $this
	 * @throws \BadFunctionCallException
	 */
	protected function setter($name, $args) {
		if (array_key_exists($name, $this->_advancedFieldTypes)) {
			$type = $this->_advancedFieldTypes[$name];
			if ($args[0] !== null && !($args[0] instanceof $type)) {
				throw new \BadFunctionCallException(
					'Argument 1 must be an object of class ' . $type
				);

			}
		}

		parent::setter($name, $args);
		return $this;
	}


	/**
	 * Adds information that a certain field is mandatory
	 * isValid will fail if a mandatory field is not set
	 *
	 * @param string $fieldName
	 * @return void
	 */
	protected function addMandatory($fieldName) {
		$this->_mandatory[] = $fieldName;
	}


	/**
	 * get list of mandatory fields
	 *
	 * @return array
	 */
	public function getMandatoryFields() {
		return $this->_mandatory;
	}


	/**
	 * Adds information about advanced field type
	 * Use this if a field needs to be an instanceof class/interface
	 *
	 * @param $fieldName
	 * @param $type
	 */
	protected function addAdvancedFieldType($fieldName, $type) {
		$this->_advancedFieldTypes[$fieldName] = $type;
	}


	/**
	 * get list of advanced fields types
	 *
	 * @return array
	 */
	public function getAdvancedFieldTypes() {
		return $this->_advancedFieldTypes;
	}


	/**
	 * check if entity's content is valid
	 * - are all mandatory fields set?
	 * - do all fields have the correct type
	 *
	 * @return boolean
	 */
	public function isValid() {
		$mandatoryFields = $this->getMandatoryFields();
		foreach($mandatoryFields as $field) {
			$value = $this->getter($field);
			if ($value === null) {
				return false;
			}
		}

		$fieldsWithRegisteredType = $this->getFieldTypes();
		foreach($fieldsWithRegisteredType as $field => $type) {
			$value = $this->getter($field);
			if ($value !== null && gettype($value) !== $type) {
				return false;
			}
		}

		$fieldsWithRegisteredAdvancedType = $this->getAdvancedFieldTypes();
		foreach($fieldsWithRegisteredAdvancedType as $field => $type) {
			$value = $this->getter($field);
			if ($value !== null && !($value instanceof $type)) {
				return false;
			}
		}

		return true;
	}
}