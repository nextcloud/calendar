<?php
/**
 * Copyright (c) 2014 Bernhard Posselt <dev@bernhard-posselt.com>
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCP\Calendar\IEntity;

abstract class Entity implements IEntity{

	/**
	 * database id
	 * @var int
	 */
	public $id;


	/**
	 * updated fields
	 * @var array
	 */
	protected $updatedFields = array();


	/**
	 * map property-name to type
	 * @var array
	 */
	protected $fieldTypes = array('id' => 'int');


	/**
	 * fields that are mandatory for a valid Entity
	 * @var array
	 */
	protected $mandatory = array();


	public function __construct($createFrom=null) {
		if (is_callable(array($this, 'registerTypes'))) {
			$this->registerTypes();
		}
		if (is_callable(array($this, 'registerMandatory'))) {
			$this->registerMandatory();
		}

		if (is_array($createFrom) && is_callable(array($this, 'fromRow'))) {
			$this->fromRow($createFrom);
		} elseif ($createFrom instanceof VCalendar) {
			$this->fromVObject($createFrom);
		} elseif (is_string($createFrom) && is_callable(array($this, 'fromData'))) {
			$this->fromData($createFrom);
		}
	}


	/**
	 * Simple alternative constructor for building entities from a request
	 * @param array $params the array which was obtained via $this->params('key')
	 * in the controller
	 * @return Entity
	 */
	public static function fromParams(array $params) {
		$instance = new static();

		foreach($params as $key => $value) {
			$method = 'set' . ucfirst($key);
			$instance->$method($value);
		}

		return $instance;
	}


	/**
	 * Maps the keys of the row array to the attributes
	 * @param array $row the row to map onto the entity
	 * @return $this
	 */
	public function fromRow(array $row){
		foreach($row as $key => $value){
			$prop = $this->columnToProperty($key);
			if ($value !== null && array_key_exists($prop, $this->fieldTypes)){
				settype($value, $this->fieldTypes[$prop]);
			}
			$this->$prop = $value;
		}
		return $this;
	}


	/**
	 * @param $id
	 * @return $this
	 */
	public function setId($id) {
		return $this->setter('id', array($id));
	}


	/**
	 * @return int
	 */
	public function getId() {
		return $this->getter('id');
	}


	/**
	 * overwrite current objects with properties
	 *        from $object that are not null
	 * @param IEntity $object
	 * @return $this
	 */
	public function overwriteWith(IEntity $object) {
		$properties = get_object_vars($this);

		unset($properties['id']);
		unset($properties['updatedFields']);
		unset($properties['fieldTypes']);
		unset($properties['mandatory']);

		foreach($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$setter = 'set' . ucfirst($key);

			$newValue = $object->$getter();
			if ($newValue !== null && $newValue !== $value) {
				$this->$setter($newValue);
			}
		}

		return $this;
	}


	/**
	 * checks if current object contains null values
	 * @return boolean
	 */
	public function doesContainNullValues() {
		$properties = get_object_vars($this);

		foreach($properties as $key => $value) {
			if($key === 'updatedFields' || $key === 'fieldTypes') {
				continue;
			}
			$method = 'get' . ucfirst($key);

			if ($this->$method() === null) {
				return true;
			}
		}

		return false;
	}


	/**
	 * Marks the entity as clean needed for setting the id after the insertion
	 */
	public function resetUpdatedFields(){
		$this->updatedFields = array();
	}


	/**
	 * @param string $name
	 * @param mixed $args
	 * @return $this
	 * @throws \BadFunctionCallException
	 */
	protected function setter($name, $args) {
		// setters should only work for existing attributes
		if (property_exists($this, $name)){
			$this->markFieldUpdated($name);

			// if type definition exists, cast to correct type
			if ($args[0] !== null && array_key_exists($name, $this->fieldTypes)) {
				//settype($args[0], $this->fieldTypes[$name]);
			}
			$this->$name = $args[0];

		} else {
			throw new \BadFunctionCallException($name . 
				' is not a valid attribute');
		}

		return $this;
	}


	/**
	 * @param string $name
	 * @return mixed
	 * @throws \BadFunctionCallException
	 */
	protected function getter($name) {
		// getters should only work for existing attributes
		if (property_exists($this, $name)){
			return $this->$name;
		} else {
			throw new \BadFunctionCallException($name . 
				' is not a valid attribute');
		}
	}


	/**
	 * Mark am attribute as updated
	 * @param string $attribute the name of the attribute
	 */
	protected function markFieldUpdated($attribute){
		$this->updatedFields[$attribute] = true;
	}


	/**
	 * Transform a database column-name to a property
	 * @param string $columnName the name of the column
	 * @return string the property name
	 */
	public function columnToProperty($columnName){
		$parts = explode('_', $columnName);
		$property = null;

		foreach($parts as $part){
			if ($property === null){
				$property = $part;
			} else {
				$property .= ucfirst($part);
			}
		}

		return $property;
	}


	/**
	 * Transform a property to a database column name
	 * @param string $property the name of the property
	 * @return string the column name
	 */
	public function propertyToColumn($property){
		$parts = preg_split('/(?=[A-Z])/', $property);
		$column = null;

		foreach($parts as $part){
			if ($column === null){
				$column = $part;
			} else {
				$column .= '_' . lcfirst($part);
			}
		}

		return $column;
	}


	/**
	 * @return array array of updated fields for update query
	 */
	public function getUpdatedFields(){
		return $this->updatedFields;
	}


	/**
	 * Adds type information for a field so that its automatically casted to
	 * that value once its being returned from the database
	 * @param string $fieldName the name of the attribute
	 * @param string $type the type which will be used to call settype()
	 */
	protected function addType($fieldName, $type){
		$this->fieldTypes[$fieldName] = $type;
	}


	protected function addMandatory($fieldName) {
		$this->mandatory[] = $fieldName;
	}

	/**
	 * Each time a setter is called, push the part after set
	 * into an array: for instance setId will save Id in the
	 * updated fields array so it can be easily used to create the
	 * getter method
	 */
	public function __call($methodName, $args){
		$attr = lcfirst( substr($methodName, 3) );

		if (strpos($methodName, 'set') === 0){
			$this->setter($attr, $args);
			return $this;
		} elseif (strpos($methodName, 'get') === 0) {
			return $this->getter($attr);
		} else {
			throw new \BadFunctionCallException($methodName .
				' does not exist');
		}

	}

	/**
	 * Slugify the value of a given attribute
	 * Warning: This doesn't result in a unique value
	 * @param string $attributeName the name of the attribute, which value should be slugified
	 * @throws \BadFunctionCallException
	 * @return string slugified value
	 */
	public function slugify($attributeName){
		// toSlug should only work for existing attributes
		if (property_exists($this, $attributeName)){
			$value = $this->$attributeName;
			// replace everything except alphanumeric with a single '-'
			$value = preg_replace('/[^A-Za-z0-9]+/', '-', $value);
			$value = strtolower($value);
			// trim '-'
			return trim($value, '-');
		} else {
			throw new \BadFunctionCallException($attributeName .
				' is not a valid attribute');
		}
	}


	/**
	 * check if entity's content is valid
	 * @return bool
	 */
	public function isValid() {
		$mandatoryFields = $this->mandatory;

		foreach($mandatoryFields as $field) {
			if($this->getter($field) === null) {
				return false;
			}
			//TODO - check type of mandatory field
		}

		return true;
	}


	/**
	 * take data from VObject and put into this Calendar object
	 * @param VCalendar $vcalendar
	 * @throws \BadFunctionCallException
	 * @return VCalendar Object
	 */
	public function fromVObject(VCalendar $vcalendar) {
		$msg = 'Can\'t create from vobject!';
		throw new \BadFunctionCallException($msg);
	}


	/**
	 * get VObject from Calendar Object
	 * @throws \BadFunctionCallException
	 * @return VCalendar Object
	 */
	public function getVObject() {
		$msg = 'Can\'t create vobject!';
		throw new \BadFunctionCallException($msg);
	}
}