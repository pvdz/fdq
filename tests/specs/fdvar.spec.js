import expect from '../fixtures/mocha_proxy.fixt';
import {
  specDomainCreateRange,
  specDomainCreateRanges,
  specDomainCreateEmpty,
  specDomainSmallEmpty,
  specDomainSmallNums,
  specDomainSmallRange,
} from '../fixtures/domain.fixt';

import {
  REJECTED,
  SOMETHING_CHANGED,
  SUB,
  SUP,
  ZERO_CHANGES,
} from '../../src/helpers';
import {
  fdvar_clone,
  fdvar_constrain,
  fdvar_create,
  fdvar_createRange,
  fdvar_forceEqInline,
  fdvar_forceNeqInline,
  fdvar_isRejected,
  fdvar_isSolved,
  fdvar_isUndetermined,
  fdvar_isValue,
  fdvar_upperBound,
  fdvar_middleElement,
  fdvar_lowerBound,
  fdvar_removeGteInline,
  fdvar_removeLteInline,
  fdvar_setDomain,
  fdvar_size,
} from '../../src/fdvar';

describe('fdvar.spec', function() {

  describe('fdvar_clone', function() {

    it('should exist', function() {
      expect(fdvar_clone).to.be.a('function');
    });

    it('should work with array domain', function() {
      let A = fdvar_create('A', specDomainCreateRange(30, SUP));

      expect(fdvar_clone(A)).to.eql(A);
    });

    it('should work with numbered domain', function() {
      let A = fdvar_create('A', specDomainSmallRange(0, 10));

      expect(fdvar_clone(A)).to.eql(A);
    });
  });

  describe('fdvar_constrain', function() {

    it('should exist', function() {
      expect(fdvar_constrain).to.be.a('function');
    });

    function one(fdvarDom, withDom, outDom, changes) {
      it(`should constrain an fdvar.dom=${fdvarDom} with dom=${withDom} to be ${outDom}`, function() {
        let A = fdvar_create('A', fdvarDom);
        let out = fdvar_constrain(A, withDom);

        expect(A.dom).to.eql(outDom);
        expect(out).to.equal(changes);
      });
    }

    describe('simple ranges', function() {
      one(specDomainSmallRange(0, 1), specDomainSmallRange(0, 1), specDomainSmallRange(0, 1), ZERO_CHANGES);
      one(specDomainSmallRange(0, 1), specDomainSmallNums(0), specDomainSmallNums(0), SOMETHING_CHANGED);
      one(specDomainSmallRange(0, 1), specDomainSmallNums(1), specDomainSmallNums(1), SOMETHING_CHANGED);
      one(specDomainSmallRange(0, 15), specDomainSmallRange(10, 12), specDomainSmallRange(10, 12), SOMETHING_CHANGED);
      one(specDomainSmallRange(0, 15), specDomainCreateRange(10, 20), specDomainSmallRange(10, 15), SOMETHING_CHANGED);
      one(specDomainCreateRange(10, 20), specDomainSmallRange(5, 15), specDomainSmallRange(10, 15), SOMETHING_CHANGED);
      one(specDomainCreateRange(10, 20), specDomainCreateRange(12, 17), specDomainCreateRange(12, 17), SOMETHING_CHANGED);
    });

    // TODO: need to fix these (I think they should end up empty), see https://github.com/the-grid/finitedomain/issues/72
    describe('some weird cases', function() {
      one(specDomainSmallRange(0, 1), specDomainSmallNums(2), specDomainSmallRange(0, 1), REJECTED);
      one(specDomainSmallRange(10, 15), specDomainSmallRange(5, 8), specDomainSmallRange(10, 15), REJECTED);
      one(specDomainCreateRange(10, 20), specDomainCreateRange(22, 30), specDomainCreateRange(10, 20), REJECTED);
    });

    describe('multiple ranges', function() {
      one(
        specDomainCreateRanges([10, 20], [30, 40]),
        specDomainCreateRange(15, 35),
        specDomainCreateRanges([15, 20], [30, 35]),
        SOMETHING_CHANGED
      );
      one(
        specDomainCreateRange(10, 50),
        specDomainCreateRanges([15, 35], [40, 60]),
        specDomainCreateRanges([15, 35], [40, 50]),
        SOMETHING_CHANGED
      );
      one(
        specDomainCreateRanges([10, 50], [100, 200], [300, 400]),
        specDomainCreateRanges([5, 8], [10, 30], [150, 350], [400, 400]),
        specDomainCreateRanges([10, 30], [150, 200], [300, 350], [400, 400]),
        SOMETHING_CHANGED
      );
    });
  });

  describe('fdvar_create', function() {

    it('should exist', function() {
      expect(fdvar_create).to.be.a('function');
    });

    it('should work with array domain', function() {
      let A = fdvar_create('A', specDomainCreateRange(30, SUP));

      expect(A.dom).to.eql(specDomainCreateRange(30, SUP));
    });

    it('should work with numbered domain', function() {
      let A = fdvar_create('A', specDomainSmallRange(0, 10));

      expect(A.dom).to.eql(specDomainSmallRange(0, 10));
    });
  });

  describe('fdvar_createRange', function() {

    it('should exist', function() {
      expect(fdvar_createRange).to.be.a('function');
    });

    it('should create a number domain', function() {
      expect(fdvar_createRange('A', 0, 15).dom).to.eql(specDomainSmallRange(0, 15));
    });

    it('should create a array domain', function() {
      expect(fdvar_createRange('A', 100, SUP).dom).to.eql(specDomainCreateRange(100, SUP));
    });

    it('should create a array domain with smaller values', function() {
      expect(fdvar_createRange('A', 10, 100).dom).to.eql(specDomainCreateRange(10, 100));
    });

    it('should throw for non-string ids', function() {
      expect(_ => fdvar_createRange(25, 10, 100)).to.throw('ID_SHOULD_BE_STRING');
    });

    it('should throw for non-numbered range', function() {
      expect(_ => fdvar_createRange('A', '10', 100)).to.throw('LO_SHOULD_BE_NUMBER');
      expect(_ => fdvar_createRange('A', 10, '100')).to.throw('HI_SHOULD_BE_NUMBER');
      expect(_ => fdvar_createRange('A', '10', '100')).to.throw('LO_SHOULD_BE_NUMBER');
      expect(_ => fdvar_createRange('A', undefined, 100)).to.throw('LO_SHOULD_BE_NUMBER');
      expect(_ => fdvar_createRange('A', 10)).to.throw('HI_SHOULD_BE_NUMBER');
      expect(_ => fdvar_createRange('A')).to.throw('LO_SHOULD_BE_NUMBER');
    });

    it('should pass on valid lo/hi', function() {
      expect(_ => fdvar_createRange('A', 1, 2)).not.to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
      expect(_ => fdvar_createRange('A', SUB - 2, 1)).to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
      expect(_ => fdvar_createRange('A', 2, SUB - 1)).to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
      expect(_ => fdvar_createRange('A', SUP + 2, 1)).to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
      expect(_ => fdvar_createRange('A', 2, SUP + 1)).to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
    });

    it('should pass on ordered lo/hi', function() {
      expect(_ => fdvar_createRange('A', 1, 2)).not.to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
      expect(_ => fdvar_createRange('A', 2, 1)).to.throw('RANGE_SHOULD_BE_PROPERLY_BOUND_AND_ORDERED');
    });
  });

  describe('fdvar_forceEqInline', function() {

    it('should exist', function() {
      expect(fdvar_forceEqInline).to.be.a('function');
    });

    describe('with array', function() {

      it('should get start end', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40]));
        let B = fdvar_create('B', specDomainCreateRanges([20, 30]));
        let C = specDomainCreateRanges([20, 20], [30, 30]);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });

      it('should return SOMETHING_CHANGED if domains are not equal and update them inline', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50]));
        let C = specDomainCreateRanges([15, 20], [30, 35], [40, 40], [50, 50]);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });

      it('should return ZERO_CHANGES if domains are equal', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let C = specDomainCreateRanges([10, 20], [30, 40], [50, 60]);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });
    });

    describe('with numbers', function() {

      it('should return SOMETHING_CHANGED if domains are not equal and update them inline', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(2, 3, 4, 5, 6, 7));
        let C = specDomainSmallNums(2, 3, 6, 7);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });

      it('should return ZERO_CHANGES if domains are equal', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let C = specDomainSmallNums(1, 2, 3, 6, 7, 8);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });
    });

    describe('with array and numbers', function() {

      it('should work with an array and a number', function() {
        let A = fdvar_create('A', specDomainCreateRange(10, 100));
        let B = fdvar_create('B', specDomainSmallRange(5, 15));
        let C = specDomainSmallRange(10, 15);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });

      it('should work with a number and an array', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 10, 11, 13));
        let B = fdvar_create('B', specDomainCreateRange(8, 100));
        let C = specDomainSmallNums(10, 11, 13);
        let R = fdvar_forceEqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', C));
        expect(B).to.eql(fdvar_create('B', C));
      });
    });
  });

  describe('fdvar_forceNeqInline', function() {
    // these tests are pretty much tbd

    it('should exist', function() {
      expect(fdvar_forceNeqInline).to.be.a('function');
    });

    describe('with array', function() {

      it('should return ZERO_CHANGES if neither domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50])));
      });

      it('should return SOMETHING_CHANGED if left domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([20, 20]));
        let B = fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([20, 20])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([15, 19], [21, 35], [40, 50])));
      });

      it('should return SOMETHING_CHANGED if right domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([15, 35], [40, 50]));
        let B = fdvar_create('B', specDomainCreateRanges([20, 20]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([15, 19], [21, 35], [40, 50])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([20, 20])));
      });

      it('should return ZERO_CHANGES if domains are equal but not solved (small)', function() {
        let A = fdvar_create('A', specDomainCreateRanges([SUP - 1, SUP]));
        let B = fdvar_create('B', specDomainCreateRanges([SUP - 1, SUP]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([SUP - 1, SUP])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([SUP - 1, SUP])));
      });

      it('should return ZERO_CHANGES if domains are equal but not solved (large)', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([10, 20], [30, 40], [50, 60])));
      });

      // TOFIX: this exposes a serious problem with assumptions on solved vars
      it('should return REJECTED if domains resolved to same value', function() {
        let A = fdvar_create('A', specDomainCreateRanges([SUP, SUP]));
        let B = fdvar_create('B', specDomainCreateRanges([SUP, SUP]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(REJECTED);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([SUP, SUP])));
        expect(B).to.eql(fdvar_create('B', specDomainSmallEmpty()));
      });

      it('should return ZERO_CHANGES both domains solve to different value', function() {
        let A = fdvar_create('A', specDomainCreateRanges([30, 30]));
        let B = fdvar_create('B', specDomainCreateRanges([40, 40]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([30, 30])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([40, 40])));
      });
    });

    describe('with numbers', function() {

      it('should return SOMETHING_CHANGED if right side was solved and the left wasnt', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(2));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(2)));
      });

      it('should return SOMETHING_CHANGED if left side was solved and the right had it', function() {
        let A = fdvar_create('A', specDomainSmallNums(2));
        let B = fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOMETHING_CHANGED);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(2)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1, 3, 6, 7, 8)));
      });

      it('should return ZERO_CHANGES if right side was solved and the left already did not have it', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(4));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(4)));
      });

      it('should return ZERO_CHANGES if left side was solved and the right already did not have it', function() {
        let A = fdvar_create('A', specDomainSmallNums(4));
        let B = fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(4)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
      });

      it('should return ZERO_CHANGES if neither domain is solved', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(2, 3, 4, 5, 6, 7));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(2, 3, 4, 5, 6, 7)));
      });

      it('should return ZERO_CHANGES if both domains are solved to different value', function() {
        let A = fdvar_create('A', specDomainSmallNums(0));
        let B = fdvar_create('B', specDomainSmallNums(1));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(0)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1)));
      });
    });

    describe('with array and numbers', function() {

      it('should work with an array and a number', function() {
        let A = fdvar_create('A', specDomainCreateRange(10, 100));
        let B = fdvar_create('B', specDomainSmallRange(5, 15));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRange(10, 100)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallRange(5, 15)));
      });

      it('should work with a numbert and an array', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 10, 11, 13));
        let B = fdvar_create('B', specDomainCreateRange(8, 100));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(ZERO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 10, 11, 13)));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRange(8, 100)));
      });
    });
  });

  describe('fdvar_isRejected', function() {

    it('should exist', function() {
      expect(fdvar_isRejected).to.be.a('function');
    });

    describe('with array', function() {

      it('should return true for empty array', function() {
        let A = fdvar_create('A', specDomainCreateEmpty());
        expect(fdvar_isRejected(A)).to.equal(true);
      });

      it('should return false for solved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([90, 90]));
        expect(fdvar_isRejected(A)).to.equal(false);

        let B = fdvar_create('B', specDomainCreateRanges([SUP, SUP]));
        expect(fdvar_isRejected(B)).to.equal(false);

        let C = fdvar_create('C', specDomainCreateRanges([SUP - 1, SUP - 1]));
        expect(fdvar_isRejected(C)).to.equal(false);
      });

      it('should return false for unsolved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([0, 100]));
        expect(fdvar_isRejected(A)).to.equal(false);

        let B = fdvar_create('B', specDomainCreateRanges([1, SUP]));
        expect(fdvar_isRejected(B)).to.equal(false);

        let C = fdvar_create('C', specDomainCreateRanges([100, 200], [300, 400]));
        expect(fdvar_isRejected(C)).to.equal(false);
      });
    });

    describe('with numbers', function() {

      it('should return true for 0', function() {
        let A = fdvar_create('A', specDomainSmallEmpty());
        expect(fdvar_isRejected(A)).to.equal(true);
      });

      it('should return false for solved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0));
        expect(fdvar_isRejected(A)).to.equal(false);

        let B = fdvar_create('B', specDomainSmallNums(1));
        expect(fdvar_isRejected(B)).to.equal(false);

        let C = fdvar_create('C', specDomainSmallNums(15));
        expect(fdvar_isRejected(C)).to.equal(false);
      });

      it('should return false for unsolved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0, 1, 5, 7, 8, 10, 11));
        expect(fdvar_isRejected(A)).to.equal(false);

        let B = fdvar_create('B', specDomainSmallNums(1, 3, 4, 9, 10));
        expect(fdvar_isRejected(B)).to.equal(false);

        let C = fdvar_create('C', specDomainSmallNums(14, 15));
        expect(fdvar_isRejected(C)).to.equal(false);
      });
    });
  });

  describe('fdvar_isSolved', function() {

    it('should exist', function() {
      expect(fdvar_isSolved).to.be.a('function');
    });

    describe('with array', function() {

      it('should return false for empty array', function() {
        let A = fdvar_create('A', specDomainCreateEmpty());
        expect(fdvar_isSolved(A)).to.equal(false);
      });

      it('should return true for solved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([90, 90]));
        expect(fdvar_isSolved(A)).to.equal(true);

        let B = fdvar_create('B', specDomainCreateRanges([SUP, SUP]));
        expect(fdvar_isSolved(B)).to.equal(true);

        let C = fdvar_create('C', specDomainCreateRanges([SUP - 1, SUP - 1]));
        expect(fdvar_isSolved(C)).to.equal(true);
      });

      it('should return false for unsolved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([0, 100]));
        expect(fdvar_isSolved(A)).to.equal(false);

        let B = fdvar_create('B', specDomainCreateRanges([1, SUP]));
        expect(fdvar_isSolved(B)).to.equal(false);

        let C = fdvar_create('C', specDomainCreateRanges([100, 200], [300, 400]));
        expect(fdvar_isSolved(C)).to.equal(false);
      });
    });

    describe('with numbers', function() {

      it('should return false for 0', function() {
        let A = fdvar_create('A', specDomainSmallEmpty());
        expect(fdvar_isSolved(A)).to.equal(false);
      });

      it('should return true for solved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0));
        expect(fdvar_isSolved(A)).to.equal(true);

        let B = fdvar_create('B', specDomainSmallNums(1));
        expect(fdvar_isSolved(B)).to.equal(true);

        let C = fdvar_create('C', specDomainSmallNums(15));
        expect(fdvar_isSolved(C)).to.equal(true);
      });

      it('should return false for unsolved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0, 1, 5, 7, 8, 10, 11));
        expect(fdvar_isSolved(A)).to.equal(false);

        let B = fdvar_create('B', specDomainSmallNums(1, 3, 4, 9, 10));
        expect(fdvar_isSolved(B)).to.equal(false);

        let C = fdvar_create('C', specDomainSmallNums(14, 15));
        expect(fdvar_isSolved(C)).to.equal(false);
      });
    });
  });

  describe('fdvar_isUndetermined', function() {

    it('should exist', function() {
      expect(fdvar_isUndetermined).to.be.a('function');
    });

    describe('with array', function() {

      it('should return false for empty array', function() {
        let A = fdvar_create('A', specDomainCreateEmpty());
        expect(fdvar_isUndetermined(A)).to.equal(false);
      });

      it('should return false for solved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([90, 90]));
        expect(fdvar_isUndetermined(A)).to.equal(false);

        let B = fdvar_create('B', specDomainCreateRanges([SUP, SUP]));
        expect(fdvar_isUndetermined(B)).to.equal(false);

        let C = fdvar_create('C', specDomainCreateRanges([SUP - 1, SUP - 1]));
        expect(fdvar_isUndetermined(C)).to.equal(false);
      });

      it('should return true for unsolved array domains', function() {
        let A = fdvar_create('A', specDomainCreateRanges([0, 100]));
        expect(fdvar_isUndetermined(A)).to.equal(true);

        let B = fdvar_create('B', specDomainCreateRanges([1, SUP]));
        expect(fdvar_isUndetermined(B)).to.equal(true);

        let C = fdvar_create('C', specDomainCreateRanges([100, 200], [300, 400]));
        expect(fdvar_isUndetermined(C)).to.equal(true);
      });
    });

    describe('with numbers', function() {

      it('should return false for 0', function() {
        let A = fdvar_create('A', specDomainSmallEmpty());
        expect(fdvar_isUndetermined(A)).to.equal(false);
      });

      it('should return false for solved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0));
        expect(fdvar_isUndetermined(A)).to.equal(false);

        let B = fdvar_create('B', specDomainSmallNums(1));
        expect(fdvar_isUndetermined(B)).to.equal(false);

        let C = fdvar_create('C', specDomainSmallNums(15));
        expect(fdvar_isUndetermined(C)).to.equal(false);
      });

      it('should return true for unsolved number domains', function() {
        let A = fdvar_create('A', specDomainSmallNums(0, 1, 5, 7, 8, 10, 11));
        expect(fdvar_isUndetermined(A)).to.equal(true);

        let B = fdvar_create('B', specDomainSmallNums(1, 3, 4, 9, 10));
        expect(fdvar_isUndetermined(B)).to.equal(true);

        let C = fdvar_create('C', specDomainSmallNums(14, 15));
        expect(fdvar_isUndetermined(C)).to.equal(true);
      });
    });
  });

  describe('fdvar_isValue', function() {

    it('should exist', function() {
      expect(fdvar_isValue).to.be.a('function');
    });

    describe('with array', function() {

      it('should return false for empty array', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), 0)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), 1)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), 5)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), 10)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), 15)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateEmpty()), SUP)).to.equal(false);
      });

      it('should return true for matching solved array domains', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([SUP, SUP])), 10)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([SUP, SUP])), SUP)).to.equal(true);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([90, 90])), 10)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([90, 90])), 90)).to.equal(true);
      });

      it('should return false for unsolved array domains', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([0, SUP])), 0)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([0, SUP])), 10)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([0, SUP])), SUP)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([90, 190])), 90)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([90, 190])), 190)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainCreateRanges([90, 190], [200, 300], [500, 500])), 500)).to.equal(false);
      });
    });

    describe('with numbers', function() {

      it('should return true for 0', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallEmpty()), 0)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallEmpty()), 1)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallEmpty()), 5)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallEmpty()), 10)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallEmpty()), SUP)).to.equal(false);
      });

      it('should return true for solved number domains', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(0)), 0)).to.equal(true);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(0)), 1)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(5)), 5)).to.equal(true);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(5)), 15)).to.equal(false);
      });

      it('should return false for unsolved number domains', function() {
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(0, 1)), 0)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(0, 3, 6)), 0)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(0, 1, 2, 3, 5)), 3)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(5, 9, 10, 11)), 9)).to.equal(false);
        expect(fdvar_isValue(fdvar_create('A', specDomainSmallNums(14, 15)), 15)).to.equal(false);
      });
    });
  });

  describe('fdvar_upperBound', function() {

    it('should exist', function() {
      expect(fdvar_upperBound).to.be.a('function');
    });

    it('should work with array domain', function() {
      expect(fdvar_upperBound(fdvar_create('A', specDomainCreateRange(SUP, SUP)))).to.equal(SUP);
      expect(fdvar_upperBound(fdvar_create('A', specDomainCreateRange(90, SUP)))).to.equal(SUP);
      expect(fdvar_upperBound(fdvar_create('A', specDomainCreateRange(300, 301)))).to.equal(301);
    });

    it('should work with numbered domain', function() {
      expect(fdvar_upperBound(fdvar_create('A', specDomainSmallNums(0)))).to.equal(0);
      expect(fdvar_upperBound(fdvar_create('A', specDomainSmallNums(1)))).to.equal(1);
      expect(fdvar_upperBound(fdvar_create('A', specDomainSmallNums(15)))).to.equal(15);
      expect(fdvar_upperBound(fdvar_create('A', specDomainSmallNums(3, 5, 9, 10)))).to.equal(10);
      expect(fdvar_upperBound(fdvar_create('A', specDomainSmallNums(1, 2)))).to.equal(2);
    });
  });

  describe('fdvar_middleElement', function() {

    it('should exist', function() {
      expect(fdvar_middleElement).to.be.a('function');
    });

    it('should work with array domain', function() {
      expect(fdvar_middleElement(fdvar_create('A', specDomainCreateRange(SUP, SUP)))).to.equal(SUP);
      expect(fdvar_middleElement(fdvar_create('A', specDomainCreateRange(SUP - 2, SUP)))).to.equal(SUP - 1);
      expect(fdvar_middleElement(fdvar_create('A', specDomainCreateRange(SUP - 3, SUP)))).to.equal(SUP - 1);
      expect(fdvar_middleElement(fdvar_create('A', specDomainCreateRange(300, 400)))).to.equal(350); // or 349
      expect(fdvar_middleElement(fdvar_create('A', specDomainCreateRanges([1000, 1500], [1600, 2000], [2100, 2101])))).to.equal(1452);
    });

    it('should work with numbered domain', function() {
      expect(fdvar_middleElement(fdvar_create('A', specDomainSmallNums(0)))).to.equal(0);
      expect(fdvar_middleElement(fdvar_create('A', specDomainSmallNums(0, 1, 2)))).to.equal(1);
      expect(fdvar_middleElement(fdvar_create('A', specDomainSmallNums(0, 1, 2, 3)))).to.equal(2);
      expect(fdvar_middleElement(fdvar_create('A', specDomainSmallRange(4, 8)))).to.equal(6);
      expect(fdvar_middleElement(fdvar_create('A', specDomainSmallNums(4, 5, 6, 7, 8, 12, 13, 14)))).to.equal(8);
    });
  });

  describe('fdvar_lowerBound', function() {

    it('should exist', function() {
      expect(fdvar_lowerBound).to.be.a('function');
    });

    it('should work with array domain', function() {
      expect(fdvar_lowerBound(fdvar_create('A', specDomainCreateRange(SUP, SUP)))).to.equal(SUP);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainCreateRange(SUP - 1, SUP)))).to.equal(SUP - 1);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainCreateRange(0, SUP)))).to.equal(0);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainCreateRange(90, SUP)))).to.equal(90);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainCreateRange(300, 301)))).to.equal(300);
    });

    it('should work with numbered domain', function() {
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(0)))).to.equal(0);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(0, 1)))).to.equal(0);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(1)))).to.equal(1);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(15)))).to.equal(15);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(3, 5, 9, 10)))).to.equal(3);
      expect(fdvar_lowerBound(fdvar_create('A', specDomainSmallNums(1, 2)))).to.equal(1);
    });
  });

  describe('fdvar_removeGteInline', function() {

    it('should exist', function() {
      expect(fdvar_removeGteInline).to.be.a('function');
    });

    describe('with array', function() {

      it('should remove all elements gte to value', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40]));
        let R = fdvar_removeGteInline(fdvar, 25);

        expect(fdvar.dom).to.eql(specDomainCreateRange(10, 20));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40]));
        let R = fdvar_removeGteInline(fdvar, 30);

        expect(fdvar.dom).to.eql(specDomainCreateRange(10, 20));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeGteInline(fdvar, 15);

        expect(fdvar.dom).to.eql(specDomainSmallRange(10, 14));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainCreateEmpty());
        let R = fdvar_removeGteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should remove SUP from SUP', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([SUP, SUP]));
        let R = fdvar_removeGteInline(fdvar, SUP);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });
    });

    describe('with number', function() {

      it('should remove all elements gte to value', function() {
        let fdvar = fdvar_create('A', specDomainSmallRange(5, 12));
        let R = fdvar_removeGteInline(fdvar, 9);

        expect(fdvar.dom).to.eql(specDomainSmallNums(5, 6, 7, 8));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_removeGteInline(fdvar, 6);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4, 5, 6));
        let R = fdvar_removeGteInline(fdvar, 4);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainSmallEmpty());
        let R = fdvar_removeGteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should remove 0 from 0', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(0));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });
    });
  });

  describe('fdvar_removeLteInline', function() {

    it('should exist', function() {
      expect(fdvar_removeLteInline).to.be.a('function');
    });

    describe('with array', function() {

      it('should remove all elements lte to value', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40]));
        let R = fdvar_removeLteInline(fdvar, 25);

        expect(fdvar.dom).to.eql(specDomainCreateRange(30, 40));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeLteInline(fdvar, 15);

        expect(fdvar.dom).to.eql(specDomainCreateRanges([16, 20]));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainCreateRanges([10, 20]));
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainCreateEmpty());
        let R = fdvar_removeLteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should remove SUP from SUP', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([SUP, SUP]));
        let R = fdvar_removeLteInline(fdvar, SUP);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });
    });

    describe('with number', function() {

      it('should remove all elements lte to value', function() {
        let fdvar = fdvar_create('A', specDomainSmallRange(5, 12));
        let R = fdvar_removeLteInline(fdvar, 9);

        expect(fdvar.dom).to.eql(specDomainSmallNums(10, 11, 12));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_removeLteInline(fdvar, 6);

        expect(fdvar.dom).to.eql(specDomainSmallNums(7, 8));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4, 5, 6));
        let R = fdvar_removeLteInline(fdvar, 4);

        expect(fdvar.dom).to.eql(specDomainSmallNums(5, 6));
        expect(R).to.equal(SOMETHING_CHANGED);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3, 4));
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainSmallEmpty());
        let R = fdvar_removeLteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(ZERO_CHANGES);
      });

      it('should remove 0 from 0', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(0));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOMETHING_CHANGED);
      });
    });
  });

  describe('fdvar_setDomain', function() {

    it('should exist', function() {
      expect(fdvar_setDomain).to.be.a('function');
    });

    it('should work with an array domain on a array domain', function() {
      let A = fdvar_create('A', specDomainCreateRange(5, 90));
      let B = specDomainCreateRange(70, 100);
      let C = specDomainCreateRange(70, 100);
      let out = fdvar_setDomain(A, B);

      expect(A).to.eql(fdvar_create('A', C));
      expect(out).to.eql(SOMETHING_CHANGED);
    });

    it('should work with an number domain on a array domain', function() {
      let A = fdvar_create('A', specDomainCreateRange(5, 90));
      let B = specDomainSmallRange(4, 11);
      let C = specDomainSmallRange(4, 11);
      let out = fdvar_setDomain(A, B);

      expect(A).to.eql(fdvar_create('A', C));
      expect(out).to.eql(SOMETHING_CHANGED);
    });

    it('should work with an array domain on a number domain', function() {
      let A = fdvar_create('A', specDomainSmallRange(4, 11));
      let B = specDomainCreateRange(5, 90);
      let C = specDomainCreateRange(5, 90);
      let out = fdvar_setDomain(A, B);

      expect(A).to.eql(fdvar_create('A', C));
      expect(out).to.eql(SOMETHING_CHANGED);
    });

    it('should work with an number domain on a number domain', function() {
      let A = fdvar_create('A', specDomainSmallRange(4, 11));
      let B = specDomainSmallRange(0, 8);
      let C = specDomainSmallRange(0, 8);
      let out = fdvar_setDomain(A, B);

      expect(A).to.eql(fdvar_create('A', C));
      expect(out).to.eql(SOMETHING_CHANGED);
    });
  });

  describe('fdvar_size', function() {
    // simple tests because it just maps to domain_size

    it('should exist', function() {
      expect(fdvar_size).to.be.a('function');
    });

    it('should work with array domain', function() {
      let A = fdvar_create('A', specDomainCreateRange(30, SUP));

      expect(fdvar_size(A)).to.eql(SUP - 29);
    });

    it('should work with numbered domain', function() {
      let A = fdvar_create('A', specDomainSmallRange(0, 10));

      expect(fdvar_size(A)).to.eql(11);
    });
  });
});