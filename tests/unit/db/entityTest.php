<?php
/**
 * ownCloud - Calendar App
 *
 * @author Bernhard Froehler
 * @copyright 2015 Bernhard Froehler <bernhard@bfroehler.info>
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
namespace OCA\Calendar\Db;

class EmptyEntity extends Entity
{}

class MandatoryFieldNoGetterEntity extends Entity
{
	public function registerMandatory() {
		$this->addMandatory('test');
	}
}

class MandatoryFieldNullGetterEntity extends Entity
{
	protected $test = null;
	public function registerMandatory() {
		$this->addMandatory('test');
	}
}
class MandatoryFieldValueGetterEntity extends Entity
{
	protected $test = "value!";
	public function registerMandatory() {
		$this->addMandatory('test');
	}
}
class MandatoryFieldValueGetterWithNonMatchingTypeEntity extends Entity
{
	protected $test = "value!";
	public function registerMandatory() {
		$this->addMandatory('test');
	}
	protected function registerTypes() {
		$this->addAdvancedFieldType('test',
			'integer');
	}
}
class MandatoryFieldValueGetterWithTypeEntity extends Entity
{
	public $test = "value!";
	public function registerMandatory() {
		$this->addMandatory('test');
	}
	protected function registerTypes() {
		$this->addAdvancedFieldType('test',
			'OCA\Calendar\Db\TestEntity');
	}
}

// just to be able to instantiate:
class TestEntity extends Entity
{}

class TestNamedEntity extends Entity
{
	public $name;
}

class EntityTest extends \PHPUnit_Framework_TestCase {

	public function testIsValidEmpty() {

		$empty = new EmptyEntity();

		// no mandatory fields, no types -> should be valid
		$this->assertTrue($empty->isValid());
	}

	/**
	 * @expectedException BadFunctionCallException
	 */
	public function testIsValidNoGeter() {

		// mandatory field, but no getter not filled -> should be invalid
		$mandatoryField = new MandatoryFieldNoGetterEntity();
		$mandatoryField->isValid();
	}

	public function testIsValidStringId() {

		// mandatory field, but no getter not filled -> should be invalid
		$stringIdEntity = new TestEntity();
		$stringIdEntity->id = "foo";
		$this->assertFalse($stringIdEntity->isValid());
	}

	public function testIsValidNullValue() {

		// mandatory field, but no getter not filled -> should be invalid
		$mandatoryField = new MandatoryFieldNullGetterEntity();
		$this->assertFalse($mandatoryField->isValid());
	}
	public function testIsValidValue() {

		// mandatory field, but no getter not filled -> should be invalid
		$mandatoryField = new MandatoryFieldValueGetterEntity();
		$this->assertTrue($mandatoryField->isValid());
	}
	/**
	 *
	 */
	public function testIsValidValueButTypeNotMatching() {

		// mandatory field, but no getter not filled -> should be invalid
		$mandatoryField = new MandatoryFieldValueGetterWithNonMatchingTypeEntity();
		$this->assertFalse($mandatoryField->isValid());
	}
	/**
	 *
	 */
	public function testIsValidValueTypeMatching() {

		// mandatory field, but no getter not filled -> should be invalid
		$mandatoryField = new MandatoryFieldValueGetterWithTypeEntity();
		$this->assertFalse($mandatoryField->isValid());
	}

	public function testGetSetId() {
		$ent = new TestEntity();
		$ent->setId(42);
		$this->assertSame($ent->getId(), 42);
	}

	public function testOverwriteWith() {
		$ent1 = new TestNamedEntity();
		$ent1->setId(1);
		$ent1->name = "test1";
		$ent2 = new TestNamedEntity();
		$ent2->setId(2);
		$ent2->name = "test2";

		$ent1->overwriteWith($ent2);

		// the ID stays the same:
		$this->assertSame($ent1->getId(), 1);
		$this->assertSame($ent2->getId(), 2);

		// all other properties are overwritten:
		$this->assertSame($ent1->name, $ent2->name);
	}

	public function testDoesContainNullValues() {

		$ent1 = new TestNamedEntity();
		$ent1->setId(1);
		$ent1->name = "test1";
		$this->assertFalse($ent1->doesContainNullValues());

		$ent2 = new TestNamedEntity();
		$ent2->setId(2);
		$ent2->name = null;
		$this->assertTrue($ent2->doesContainNullValues());

		$ent3 = new TestEntity();
		// id is not set, should also be null
		$this->assertTrue($ent3->doesContainNullValues());
	}

	/**
	 * @expectedException BadFunctionCallException
	 */
	public function testSetterWrongType() {

		$ent = new MandatoryFieldValueGetterWithNonMatchingTypeEntity();
		$ent->setTest("test");
	}
	public function testSetterRightType() {
		$ent = new MandatoryFieldValueGetterWithTypeEntity();
		$testClass = new TestEntity();
		$ent->setTest($testClass);
		$this->assertSame($ent->test, $testClass);
	}
}