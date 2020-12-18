// binary.js
// Coding along with Low Level JavaScript YouTube channel

// Map over array using second array elements as callback input
const combineMap = (a1, a2, fn) => {
  return a1.map((x, i) => fn(x, a2[i]));
};

// Reverse array without modifying original array
//   JS Array.reverse() modifies in place,
//   So we'll spread the given array into a new array
//   and reverse that array.
const reverse = a => [...a].reverse();

// Binary class definition
class Binary {
	constructor(bits) {
		this.bits = bits;
	}

  // Asserts that a given Binary object is
  //   of the same number of bits as this Binary
  assertSameNumberOfBits(other) {
    if (other.bits.length !== this.bits.length) {
      throw new Error(`Bit mismatch (a = ${this.bits.length}, b = ${other.bits.length})`);
    }
  }

  // Asserts that a given object is a Binary object.
  assertIsBinary(other) {
    if (!(other instanceof Binary)) {
      throw new Error(`Not an instance of Binary`);
    }
  }

  // Create a new Binary object from a signed integer.
  //   - First create a Binary from the absolute value of (n)
  //   - Then capture the number of necessary bits: 1 more than this since
  //       we need a Signed Bit.
  //   - Zero Extend the unsigned Binary to the necessary number of bits.
  //   - If (n) was postive we can return this new Binary with the new signed bit.
  //   - If not, we flip the bits and add Binary 1
  static fromSigned(n) {
    if(!Number.isInteger(n)) {
      throw new Error(`Can only create Binary from integers.`);
    }

    if (n === 0) {
      return new Binary([0]);
    }

    const unsigned = Binary.fromUnsigned(Math.abs(n));
    const numberOfBits = unsigned.bits.length + 1;
    const withZeroSignBit = unsigned.zeroExtend(numberOfBits);

    if (n > 0) {
      return withZeroSignBit;
    }

    const flipped = withZeroSignBit.not();
    const withAddedOne = flipped.add(Binary.fromUnsigned(1).zeroExtend(numberOfBits));
    return new Binary(withAddedOne.bits.slice(1));
  }

  // Create a new Binary object from an unsigned integer.
  //   - Subtract powers of 2 from (n) starting with the largest fit.
  //   - As we count down the exponents, if the result fits in what's
  //       left (in our copy) of (n), push a 1 into our array.
  //   - If the result is larger is too much to subtract, push a 0 into the array.
  static fromUnsigned(n) {
    if (!Number.isInteger(n)) {
      throw new Error(`Can only create Binary from integers.`);
    }

    if (n === 0) {
      return new Binary([0]);
    }

    const bits = [];
    let nearestPowerOfTwo = Math.floor(Math.log2(n));
    let numberInProgress = n;

    while (nearestPowerOfTwo >= 0) {
      if (numberInProgress >= 2**nearestPowerOfTwo) {
        bits.push(1);
        numberInProgress -= 2**nearestPowerOfTwo;
      } else {
        bits.push(0);
      }
      nearestPowerOfTwo -= 1;
    }

    return new Binary(bits);
  }

  // Convert this signed Binary object to a signed number.
  //   - If the Sign bit is 0, then the Binary is positive and we
  //       can return it as a Number.
  //   - Otherwise we reverse the steps taken to create the signed Binary:
  //   - To subtract 1, create a Binary of all 1's since -1 will
  //       always be all 1's.
  //   - Add this negative 1 to this Binary (which will create a Carry bit)
  //       and then flip the results absolute positive value.
  //   - Create a new, positive Binary object with all the bits EXCEPT the
  //       Carry bit that has been added in position 0.
  //   - return that Binary as a Number with (-) in front.
  toSignedNumber() {
    if (this.bits[0] === 0) {
      return this.toNumber();
    }

    const minusOneBits = Array.from({length: this.bits.length}, () => 1);
    const minusOne = new Binary(minusOneBits);

    const positiveWithCarry = this.add(minusOne).not();
    const positiveNumber = new Binary(positiveWithCarry.bits.slice(1));
    return -positiveNumber.toNumber();
  }

  // Convert this unsigned Binary object to a number
  //   - For each bit, determine the Power Of Two that bit represents.
  //   - Then, if that bit is set to 1, add that value to the running total.
	toNumber() {
		let total = 0;

		this.bits.forEach((bit, i) => {
			const powerOfTwo = this.bits.length - i - 1;
			if (bit === 1) {
				total += 2**powerOfTwo;
			}
		});

		return total;
  }
  
  // Given a number of bits,
  //   - Find how many 0's we need by subtracting this.bits.length from
  //      the given number.
  //   - Create an array of that many 0's
  //   - Spread the new 0's array and the existin bit array into a new array.
  //   - Create a new Binary object with this extended array.
  zeroExtend(nBits) {
    if (nBits <= this.bits.length) {
      throw new Error(`Need to extend to a larger number of bits (current = ${this.bits.length}, target = ${nBits})`);
    }

    const numberExtraZeros = nBits - this.bits.length;
    const zeros = Array.from({length: numberExtraZeros}, () => 0);
    return new Binary([...zeros, ...this.bits]);
  }

  // Using a given Binary object
  //   Pass its length to zeroExtend()
  zeroExtendToMatch(other) {
    this.assertIsBinary(other);
    return this.zeroExtend(other.bits.length);
  }

  // Try implementing with a for loop that iterates backwards and
  //   inserts bits from the other end.
  add(other) {
    this.assertIsBinary(other);
    this.assertSameNumberOfBits(other);

    let carryBit = 0;

    const newBits = combineMap(reverse(this.bits), reverse(other.bits), (a, b) => {
      const abSum = a ^ b;
      const abCarry = a & b;

      const abSumPlusCarry = abSum ^ carryBit;
      const abSumCarry = abSum & carryBit;

      carryBit = abCarry | abSumCarry;
      return abSumPlusCarry;
    });

    return new Binary([carryBit, ...reverse(newBits)]);
  }

  and(other) {
    this.assertIsBinary(other);
    this.assertSameNumberOfBits(other);
    const newBits = combineMap(this.bits, other.bits, (bit1, bit2) => bit1 & bit2);
    return new Binary(newBits);
  }

  or(other) {
    this.assertIsBinary(other);
    this.assertSameNumberOfBits(other);
    const newBits = combineMap(this.bits, other.bits, (bit1, bit2) => bit1 | bit2);
    return new Binary(newBits);
  }

  xor(other) {
    this.assertIsBinary(other);
    this.assertSameNumberOfBits(other);
    const newBits = combineMap(this.bits, other.bits, (bit1, bit2) => bit1 ^ bit2);
    return new Binary(newBits);
  }

  not() {
    const newBits = this.bits.map(x => x === 0 ? 1 : 0);
    return new Binary(newBits);
  }

}


/* TESTS

//// Binary Class
const fourBitNumber = new Binary([1,1,0,0]);
console.log(fourBitNumber.toNumber()); // 12

//// Operations
const a = new Binary([1,0,1,1]);
const b = new Binary([1,1,0,1]);

console.log(a.and(b)); // 1001
console.log(a.or(b)); // 1111
console.log(a.xor(b)); // 0110
console.log(a.now()); // 0100

//// Unsigned Numbers
console.log(Binary.fromUnsigned(10)); // 1010
console.log(Binary.fromUnsigned(10).toNumber()); // 10

//// Zero Extension
const a = Binary.fromUnsigned(11); // 1011
const b = Binary.fromUnsigned(5).zeroExtendToMatch(a); // 101 then 0101
console.log(a.add(b)); // 10000

//// Twos Complement
const a = Binary.fromSigned(-5); // 1011 (1 + (~ 8-bit 5))
console.log(a.toSignedNumber());

*/