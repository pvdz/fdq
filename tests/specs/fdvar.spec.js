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
  NO_CHANGES,
  REJECTED,
  SOME_CHANGES,
  SUP,
} from '../../src/helpers';
import {
  fdvar_create,
  fdvar_forceNeqInline,
  fdvar_removeGteInline,
  fdvar_removeLteInline,
} from '../../src/fdvar';

describe('fdvar.spec', function() {

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

  describe('fdvar_forceNeqInline', function() {
    // these tests are pretty much tbd

    it('should exist', function() {
      expect(fdvar_forceNeqInline).to.be.a('function');
    });

    describe('with array', function() {

      it('should return NO_CHANGES if neither domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50])));
      });

      it('should return SOME_CHANGES if left domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([20, 20]));
        let B = fdvar_create('B', specDomainCreateRanges([15, 35], [40, 50]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOME_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([20, 20])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([15, 19], [21, 35], [40, 50])));
      });

      it('should return SOME_CHANGES if right domain is solved', function() {
        let A = fdvar_create('A', specDomainCreateRanges([15, 35], [40, 50]));
        let B = fdvar_create('B', specDomainCreateRanges([20, 20]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOME_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([15, 19], [21, 35], [40, 50])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([20, 20])));
      });

      it('should return NO_CHANGES if domains are equal but not solved (small)', function() {
        let A = fdvar_create('A', specDomainCreateRanges([SUP - 1, SUP]));
        let B = fdvar_create('B', specDomainCreateRanges([SUP - 1, SUP]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([SUP - 1, SUP])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([SUP - 1, SUP])));
      });

      it('should return NO_CHANGES if domains are equal but not solved (large)', function() {
        let A = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let B = fdvar_create('B', specDomainCreateRanges([10, 20], [30, 40], [50, 60]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
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

      it('should return NO_CHANGES both domains solve to different value', function() {
        let A = fdvar_create('A', specDomainCreateRanges([30, 30]));
        let B = fdvar_create('B', specDomainCreateRanges([40, 40]));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRanges([30, 30])));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRanges([40, 40])));
      });
    });

    describe('with numbers', function() {

      it('should return SOME_CHANGES if right side was solved and the left wasnt', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(2));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOME_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(2)));
      });

      it('should return SOME_CHANGES if left side was solved and the right had it', function() {
        let A = fdvar_create('A', specDomainSmallNums(2));
        let B = fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(SOME_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(2)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1, 3, 6, 7, 8)));
      });

      it('should return NO_CHANGES if right side was solved and the left already did not have it', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(4));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(4)));
      });

      it('should return NO_CHANGES if left side was solved and the right already did not have it', function() {
        let A = fdvar_create('A', specDomainSmallNums(4));
        let B = fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(4)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
      });

      it('should return NO_CHANGES if neither domain is solved', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let B = fdvar_create('B', specDomainSmallNums(2, 3, 4, 5, 6, 7));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(2, 3, 4, 5, 6, 7)));
      });

      it('should return NO_CHANGES if both domains are solved to different value', function() {
        let A = fdvar_create('A', specDomainSmallNums(0));
        let B = fdvar_create('B', specDomainSmallNums(1));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(0)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallNums(1)));
      });
    });

    describe('with array and numbers', function() {

      it('should work with an array and a number', function() {
        let A = fdvar_create('A', specDomainCreateRange(10, 100));
        let B = fdvar_create('B', specDomainSmallRange(5, 15));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainCreateRange(10, 100)));
        expect(B).to.eql(fdvar_create('B', specDomainSmallRange(5, 15)));
      });

      it('should work with a numbert and an array', function() {
        let A = fdvar_create('A', specDomainSmallNums(1, 2, 3, 10, 11, 13));
        let B = fdvar_create('B', specDomainCreateRange(8, 100));
        let R = fdvar_forceNeqInline(A, B);

        expect(R).to.eql(NO_CHANGES);
        expect(A).to.eql(fdvar_create('A', specDomainSmallNums(1, 2, 3, 10, 11, 13)));
        expect(B).to.eql(fdvar_create('B', specDomainCreateRange(8, 100)));
      });
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
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20], [30, 40]));
        let R = fdvar_removeGteInline(fdvar, 30);

        expect(fdvar.dom).to.eql(specDomainCreateRange(10, 20));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeGteInline(fdvar, 15);

        expect(fdvar.dom).to.eql(specDomainSmallRange(10, 14));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainCreateEmpty());
        let R = fdvar_removeGteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(NO_CHANGES);
      });

      it('should remove SUP from SUP', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([SUP, SUP]));
        let R = fdvar_removeGteInline(fdvar, SUP);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
      });
    });

    describe('with number', function() {

      it('should remove all elements gte to value', function() {
        let fdvar = fdvar_create('A', specDomainSmallRange(5, 12));
        let R = fdvar_removeGteInline(fdvar, 9);

        expect(fdvar.dom).to.eql(specDomainSmallNums(5, 6, 7, 8));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_removeGteInline(fdvar, 6);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4, 5, 6));
        let R = fdvar_removeGteInline(fdvar, 4);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainSmallEmpty());
        let R = fdvar_removeGteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(NO_CHANGES);
      });

      it('should remove 0 from 0', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(0));
        let R = fdvar_removeGteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
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
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeLteInline(fdvar, 15);

        expect(fdvar.dom).to.eql(specDomainCreateRanges([16, 20]));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([10, 20]));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainCreateRanges([10, 20]));
        expect(R).to.equal(NO_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainCreateEmpty());
        let R = fdvar_removeLteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(NO_CHANGES);
      });

      it('should remove SUP from SUP', function() {
        let fdvar = fdvar_create('A', specDomainCreateRanges([SUP, SUP]));
        let R = fdvar_removeLteInline(fdvar, SUP);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
      });
    });

    describe('with number', function() {

      it('should remove all elements lte to value', function() {
        let fdvar = fdvar_create('A', specDomainSmallRange(5, 12));
        let R = fdvar_removeLteInline(fdvar, 9);

        expect(fdvar.dom).to.eql(specDomainSmallNums(10, 11, 12));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should remove an element equal to value as well', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 6, 7, 8));
        let R = fdvar_removeLteInline(fdvar, 6);

        expect(fdvar.dom).to.eql(specDomainSmallNums(7, 8));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should be able to split up a range', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4, 5, 6));
        let R = fdvar_removeLteInline(fdvar, 4);

        expect(fdvar.dom).to.eql(specDomainSmallNums(5, 6));
        expect(R).to.equal(SOME_CHANGES);
      });

      it('should accept zero', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(1, 2, 3, 4));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallNums(1, 2, 3, 4));
        expect(R).to.equal(NO_CHANGES);
      });

      it('should accept empty array', function() {
        let fdvar = fdvar_create('A', specDomainSmallEmpty());
        let R = fdvar_removeLteInline(fdvar, 35);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(NO_CHANGES);
      });

      it('should remove 0 from 0', function() {
        let fdvar = fdvar_create('A', specDomainSmallNums(0));
        let R = fdvar_removeLteInline(fdvar, 0);

        expect(fdvar.dom).to.eql(specDomainSmallEmpty());
        expect(R).to.equal(SOME_CHANGES);
      });
    });
  });
});
