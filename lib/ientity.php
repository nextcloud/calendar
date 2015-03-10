<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar;

interface IEntity {

	/**
	 * Simple alternative constructor for building entities from a request
	 * @param array $params the array which was obtained via $this->params('key')
	 * in the controller
	 * @return IEntity
	 */
	public static function fromParams(array $params);


	/**
	 * Maps the keys of the row array to the attributes
	 * @param array $row the row to map onto the entity
	 * @return $this
	 */
	public static function fromRow(array $row);

	/**
	 * @param $id
	 * @return $this
	 */
	public function setId($id);


	/**
	 * @return int
	 */
	public function getId();


	/**
	 * overwrite current objects with properties
	 *        from $object that are not null
	 * @param IEntity $object
	 * @return $this
	 */
	public function overwriteWith(IEntity $object);


	/**
	 * checks if current object contains null values
	 * @return boolean
	 */
	public function doesContainNullValues();


	/**
	 * Marks the entity as clean needed for setting the id after the insertion
	 * @return void
	 */
	public function resetUpdatedFields();


	/**
	 * Transform a database column-name to a property
	 * @param string $columnName the name of the column
	 * @return string the property name
	 */
	public function columnToProperty($columnName);


	/**
	 * Transform a property to a database column name
	 * @param string $property the name of the property
	 * @return string the column name
	 */
	public function propertyToColumn($property);


	/**
	 * @return array array of updated fields for update query
	 */
	public function getUpdatedFields();


	/**
	 * Slugify the value of a given attribute
	 * Warning: This doesn't result in a unique value
	 * @param string $attributeName the name of the attribute, which value should be slugified
	 * @throws \BadFunctionCallException
	 * @return string slugified value
	 */
	public function slugify($attributeName);


	/**
	 * check if entity's content is valid
	 * @return bool
	 */
	public function isValid();
}