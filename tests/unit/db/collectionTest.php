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
namespace OCA\Calendar\Db;

class ConcreteCollection extends Collection {

}

class TestEntity extends Entity {
	private $name;
	public function __construct($name)
	{
		$this->name = $name;
	}
	public function getName() {
		return $this->name;
	}
}

class CollectionTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @var \OCA\Calendar\Db\Collection
	 */
	protected $coll;

	/**
	 * Test entities:
	 */
	const TestEntityCount=7;
	protected $testEntities;

	public function setUp() {
		parent::setUp();
		for ($i=0; $i<CollectionTest::TestEntityCount; ++$i)
		{
			$this->testEntities[] = new TestEntity((string)$i);
		}
		$this->coll = ConcreteCollection::fromEntity($this->testEntities[1]);
	}

	public function testFromEntity() {

		$collection = ConcreteCollection::fromEntity($this->testEntities[1]);

		$this->assertSame($collection->count(), 1);
		$this->assertEquals($collection->getObjects()[0], $this->testEntities[1]);
	}

	/**
	 * @expectedException PHPUnit_Framework_Error
	 */
	public function testFailedFromEntity() {

		ConcreteCollection::fromEntity("No IEntity");
	}

	public function testFromCollection() {
		$collection = ConcreteCollection::fromCollection($this->coll);

		$this->assertSame ($collection->count(), 1);
		$this->assertEquals ($collection->getObjects()[0], $this->testEntities[1]);
	}

	public function testFromArray() {

		$testEmptyArray = array();
		$coll1 = ConcreteCollection::fromArray($testEmptyArray);

		$this->assertSame ($coll1->count(), 0);

		$testTwoElementArray = array($this->testEntities[1], $this->testEntities[2]);
		$coll2 = ConcreteCollection::fromArray($testTwoElementArray);

		$this->assertSame ($coll2->count(), 2);
		$this->assertEquals ($coll2->getObjects()[0], $this->testEntities[1]);
		$this->assertEquals ($coll2->getObjects()[1], $this->testEntities[2]);
	}

	/**
	 * @expectedException PHPUnit_Framework_Error
	 */
	public function testFailedFromArray() {

		ConcreteCollection::fromEntity(array("No IEntity 1", "No IEntity 2"));
	}

	public function testAdd() {

		$this->coll->add($this->testEntities[0], 0);
		$this->assertSame ($this->coll->count(), 2);
		$this->assertSame ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertSame ($this->coll->getObjects()[1], $this->testEntities[1]);


		$this->coll->add($this->testEntities[2], 1);
		$this->assertSame ($this->coll->count(), 3);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);


		$this->coll->add($this->testEntities[3], 3);
		$this->assertSame ($this->coll->count(), 4);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[3]);

		// TODO: should we have an error if nth is bigger than count ?
		$this->coll->add($this->testEntities[4], 5);
		$this->assertSame ($this->coll->count(), 5);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[4]);


		// TODO: is this wanted to be accepted? have added it to the doc for now
		$this->coll->add($this->testEntities[5], -1);
		$this->assertSame ($this->coll->count(), 6);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[5]);
		$this->assertEquals ($this->coll->getObjects()[5], $this->testEntities[4]);

		$this->coll->add($this->testEntities[6]);
		$this->assertSame ($this->coll->count(),7);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[0]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[5]);
		$this->assertEquals ($this->coll->getObjects()[5], $this->testEntities[4]);
		$this->assertEquals ($this->coll->getObjects()[6], $this->testEntities[6]);
	}

	/**
	 * @expectedException PHPUnit_Framework_Error
	 */
	public function testFailingAdd() {

		$this->coll->add("No IEntity");
	}

	public function testAddCollection() {

		$testTwoElementArray = array($this->testEntities[2], $this->testEntities[3]);
		$coll2 = ConcreteCollection::fromArray($testTwoElementArray);

		$this->coll->addCollection($coll2);
		$this->assertSame   ($this->coll->count(), 3);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[3]);

		$this->coll->addCollection($coll2, 0);
		$this->assertSame   ($this->coll->count(), 5);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[3]);

		$oneElementArray = array($this->testEntities[5]);
		$coll3 = ConcreteCollection::fromArray($oneElementArray);
		$this->coll->addCollection($coll3, -1);
		$this->assertSame   ($this->coll->count(), 6);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[5]);
		$this->assertEquals ($this->coll->getObjects()[5], $this->testEntities[3]);
	}

	public function testAddObjects() {
		$testTwoElementArray = array($this->testEntities[2], $this->testEntities[3]);

		$this->coll->addObjects($testTwoElementArray);
		$this->assertSame   ($this->coll->count(), 3);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[3]);

		$this->coll->addObjects($testTwoElementArray, 0);
		$this->assertSame   ($this->coll->count(), 5);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[3]);

		$oneElementArray = array($this->testEntities[5]);
		$this->coll->addObjects($oneElementArray, -1);
		$this->assertSame   ($this->coll->count(), 6);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[3]);
		$this->assertEquals ($this->coll->getObjects()[2], $this->testEntities[1]);
		$this->assertEquals ($this->coll->getObjects()[3], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[4], $this->testEntities[5]);
		$this->assertEquals ($this->coll->getObjects()[5], $this->testEntities[3]);
	}

	public function testSetObjects() {

		$testTwoElementArray = array($this->testEntities[2], $this->testEntities[3]);

		$this->coll->setObjects($testTwoElementArray);
		$this->assertSame   ($this->coll->count(), 2);
		$this->assertEquals ($this->coll->getObjects()[0], $this->testEntities[2]);
		$this->assertEquals ($this->coll->getObjects()[1], $this->testEntities[3]);
	}

	public function testSubSet() {
		$coll2 = $this->coll->subset();

		$this->assertEquals($this->coll, $coll2);
		$this->assertSame($coll2->count(), 1);

		$this->coll->add($this->testEntities[2]);
		// check that $coll2 hasn't changed:
		$this->assertSame($coll2->count(), 1);

		$coll3 = $this->coll->subset(1);
		$this->assertSame   ($coll3->count(), 1);
		$this->assertEquals ($coll3->getObjects()[0], $this->testEntities[1]);

		$coll4 = $this->coll->subset(1, 1);
		$this->assertSame   ($coll4->count(), 1);
		$this->assertEquals ($coll4->getObjects()[0], $this->testEntities[2]);

		$coll5 = $this->coll->subset(null, 1);
		$this->assertSame   ($coll4->count(), 1);
		$this->assertEquals ($coll4->getObjects()[0], $this->testEntities[2]);
	}

	public function testInCollection() {
		$this->assertTrue ( $this->coll->inCollection($this->testEntities[1]));
		$this->assertFalse( $this->coll->inCollection($this->testEntities[2]));
	}

	public function testSearch() {

		$coll1 = $this->coll->search("name", "");
		$this->assertSame($coll1->count(), 0);

		$coll1 = $this->coll->search("name", "1");
		$this->assertSame($coll1->count(), 1);

		$this->coll->add($this->testEntities[1]);
		$coll1 = $this->coll->search("name", "1");
		$this->assertSame($coll1->count(), 2);
	}

	public function testSetProperty() {

		$mockedEntity = $this->getMock('\OCA\Calendar\Db\Entity');
		$mockedEntity->expects($this->once())
			->method('setId')
			->with($this->equalTo("1.5"));

		$coll = ConcreteCollection::fromEntity($mockedEntity);
		$coll->setProperty('id', '1.5');
	}

	public function testIsValid() {

		$mockedValid = $this->getMock('\OCA\Calendar\Db\Entity');
		$mockedValid->expects($this->any())
			->method('isValid')
			->will($this->returnValue(true));

		$mockedInvalid = $this->getMock('\OCA\Calendar\Db\Entity');
		$mockedInvalid->expects($this->once())
			->method('isValid')
			->will($this->returnValue(false));

		$coll = ConcreteCollection::fromEntity($mockedValid);
		$this->assertTrue($coll->isValid());

		$coll->add($mockedInvalid);
		$this->assertFalse($coll->isValid());
	}

	/*
	public function testNoDuplicates() {
		$this->coll->add($this->testEntities[1]);
		$this->assertSame($this->coll->count(), 2);
		$collUnique = $this->coll->noDuplicates();
		$this->assertSame($collUnique->count(), 1);
	}
	*/

	public function testOffsetGet() {
		$this->assertSame($this->coll->offsetGet(-1), null);
		$this->assertSame($this->coll->offsetGet(0), $this->coll->getObjects()[0]);
		$this->assertSame($this->coll->offsetGet(1), null);
		$this->assertSame($this->coll->offsetGet('foo'), null);
	}

	public function testOffsetSet() {
		$entity0 = & $this->coll->getObjects()[0];
		$this->coll->offsetSet(0, 'foo');
		$this->assertSame($this->coll->getObjects()[0], $entity0);

		$entity2 = $this->testEntities[2];
		$this->coll->offsetSet(0, $entity2);
		$this->assertSame($this->coll->offsetGet(0), $entity2);
	}

	public function testOffsetUnset() {
		$this->coll->offsetUnset(0);
		$this->assertSame($this->coll->count(), 0);
		$this->assertFalse(isset($this->coll->getObjects()[0]));
	}

	public function testReset() {
		$this->coll->reset();
		$this->assertSame($this->coll->count(), 0);

		// should also work on empty list
		$this->coll->reset();
		$this->assertSame($this->coll->count(), 0);
	}


	public function testIterate() {
		$this->coll->add($this->testEntities[2]);

		$this->assertEquals($this->coll->key(), 0);
		$this->assertEquals($this->coll->current(), $this->testEntities[1]);
		$this->assertTrue  ($this->coll->valid());
		$this->coll->next();
		$this->assertEquals($this->coll->key(), 1);
		$this->assertEquals($this->coll->current(), $this->testEntities[2]);
		$this->assertTrue  ($this->coll->valid());
		$this->coll->next();
		$this->assertEquals($this->coll->key(), null);
		$this->assertEquals($this->coll->current(), FALSE);
		$this->assertFalse ($this->coll->valid());

		$this->coll->rewind();
		$this->assertEquals($this->coll->key(), 0);
		$this->assertEquals($this->coll->current(), $this->testEntities[1]);
		$this->assertTrue  ($this->coll->valid());
	}
}
