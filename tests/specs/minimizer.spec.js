import expect from '../fixtures/mocha_proxy.fixt';
import solverSolver from '../../src/runner';

describe('specs/minimizer.spec', function() {

  describe('bool iseq', function() {

    it('should rewrite 01=01==?0 to A!=R', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : R [0 1]
        R = A ==? 0
      `);

      expect(solution).to.eql({A: 1, R: 0});
    });

    it('should rewrite 01=01==?1 to A==R', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : R [0 1]
        R = A ==? 1
      `);

      expect(solution).to.eql({A: 0, R: 0});
    });

    it('should rewrite 01=02==?0 to A!=R', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 2 2]
        : R [0 1]
        R = A ==? 0
      `);

      // R is leaf, constraint cut away, R's reflection is deferred, A becomes free, so it solves
      expect(solution).to.eql({A: 0, R: 1});
    });

    it('should rewrite [01]=[00xx]==?x to XNOR', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 2 2]
        : R [0 1]
        R = A ==? 2
      `);

      expect(solution).to.eql({A: 0, R: 0});
    });

    it('should rewrite [01]=[00xx]==?x to XNOR', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 2000 2000]
        : B = 2000
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: 0, B: 2000, R: 0});
    });

    it('should rewrite [01]=[00xx]==?x to XNOR', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A = 2000
        : B [0 0 2000 2000]
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: 2000, B: 0, R: 0});
    });

    it('should not even consider weird domain values sans 1', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A = [0 1]
        : B [0 0 2000 2000]
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: 0, B: 0, R: 1});
    });

    it('should not even consider weird domain values lt 1', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A = [0 1]
        : B [2 2000]
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: [0, 1], B: [2, 2000], R: 0});
    });

    it('should not even consider weird domain values sans 0', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A = [0 1]
        : B [1 2000]
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: 0, B: 1, R: 0});
    });

    it('should not even consider weird domain values bool', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A = [0 1]
        : B [0 2000]
        : R [0 1]
        R = A ==? B
      `);

      expect(solution).to.eql({A: 0, B: 0, R: 1});
    });

    it('should not rewrite to div because of this case', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 5]
        : C [0 1]
        C = A ==? 5
        A = 4
      `);

      expect(solution).to.eql({A: 4, C: 0});
    });
  });

  describe('plus', function() {

    it('should rewrite 12=01+01 to OR', function() {
      // if A and B are max 1 and C is 12 then one must be one but both may be on
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : B [0 1]
        : R [1 2]
        R = A + B
      `);

      expect(solution).to.eql({A: 1, B: 0, R: 1});
    });

    it('should not rewrite [01]=[12]+1 to LT', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : C [1 2]
        C = A + 1
      `);

      expect(solution).to.eql({A: 0, C: 1, __1: 1}); // anon var is because plus doesnt use constants so a var is generated for `1`
    });

    it('should not rewrite [0055]=[1166]+1 to LT lr', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : C [1 1 6 6]
        C = A + 1
      `);

      expect(solution).to.eql({A: 0, C: 1, __1: 1}); // anon var is because plus doesnt use constants so a var is generated for `1`
    });

    it('should not rewrite [0055]=[1166]+1 to LT rl', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : C [1 1 6 6]
        C = 1 + A
      `);

      expect(solution).to.eql({A: 0, C: 1, __1: 1}); // anon var is because plus doesnt use constants so a var is generated for `1`
    });

    it('should not fall into this trap for [01]=[12]+1', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : C [1 2]
        C = A + 1
        # 0 < 2 but wont satisfy A < C
        A = 0
        C = 2
      `);

      expect(solution).to.eql(false);
    });

    it('should not fall into this trap for [01]=1+[12]', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 1]
        : C [1 2]
        C = 1 + A
        # 0 < 2 but wont satisfy A < C
        A = 0
        C = 2
      `);

      expect(solution).to.eql(false);
    });

    it('should not fall into this trap for [0055]=[1166]+1', function() {
      let solution = solverSolver(`
        @custom var-strat throw
        : A [0 0 5 5]
        : C [1 1 6 6]
        C = A + 1
        # 0 < 6 but wont satisfy A < C
        A = 0
        C = 6
      `);

      expect(solution).to.eql(false);
    });
  });
});
