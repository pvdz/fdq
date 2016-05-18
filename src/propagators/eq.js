/*

domains, internally, can be either an array or a number
if its a number then that's a bitwise flag for a range of [0,15]

spaces track var ranges through a single object; name: domain
domains should probably be tracked centrally

manually computed domains can lead to duplication but that's
deduping will still lead to saving on cloning

 */

import {
  ASSERT_DOMAIN_EMPTY_CHECK,
} from '../helpers';

import {
  domain_isSolved,
  domain_sharesNoElements,
} from '../domain';

import {
  fdvar_forceEqInline,
} from '../fdvar';

// BODY_START

/**
 * This eq propagator looks a lot different from neq because in
 * eq we can prune early all values that are not covered by both.
 * Any value that is not covered by both can not be a valid solution
 * that holds this constraint. In neq that's different and we can
 * only start pruning once at least one var has a solution.
 * Basically eq is much more efficient compared to neq because we
 * can potentially skip a lot of values early.
 *
 * @param {Fdvar} fdvar1
 * @param {Fdvar} fdvar2
 * @returns {$domain}
 */
function propagator_eqStepBare(fdvar1, fdvar2) {
  return fdvar_forceEqInline(fdvar1, fdvar2);
}

/**
 * The eq step would reject if there all elements in one domain
 * do not occur in the other domain. Because then there's no
 * valid option to make sure A=B holds. So search for such value
 * or return false.
 * Read only check
 *
 * @param {Fdvar} fdvar1
 * @param {Fdvar} fdvar2
 * @returns {*}
 */
function propagator_eqStepWouldReject(fdvar1, fdvar2) {
  let dom1 = fdvar1.dom;
  let dom2 = fdvar2.dom;

  ASSERT_DOMAIN_EMPTY_CHECK(dom1);
  ASSERT_DOMAIN_EMPTY_CHECK(dom2);
//    if domain_isRejected dom1 or domain_isRejected dom2
//      return true

  return domain_sharesNoElements(dom1, dom2);
}

/**
 * An eq propagator is solved when both its vars are
 * solved. Any other state may still lead to failure.
 *
 * @param {Fdvar} fdvar1
 * @param {Fdvar} fdvar2
 * @returns {boolean}
 */
function propagator_eqSolved(fdvar1, fdvar2) {
  return domain_isSolved(fdvar1.dom) && domain_isSolved(fdvar2.dom);
}

// BODY_STOP

export {
  propagator_eqStepBare,
  propagator_eqStepWouldReject,
  propagator_eqSolved,
};
