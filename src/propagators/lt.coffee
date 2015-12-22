module.exports = (FD) ->
  {
    REJECTED
    ZERO_CHANGES

    ASSERT_DOMAIN
    ASSERT_DOMAIN_EMPTY_CHECK
  } = FD.helpers

  {
    domain_is_rejected
    domain_max
    domain_min
  } = FD.Domain

  {
    fdvar_is_rejected
    fdvar_lower_bound
    fdvar_remove_gte_inline
    fdvar_remove_lte_inline
    fdvar_upper_bound
  } = FD.Var

  lt_step_bare = (fdvar1, fdvar2) ->
    lo_1 = fdvar_lower_bound fdvar1
    hi_1 = fdvar_upper_bound fdvar1
    lo_2 = fdvar_lower_bound fdvar2
    hi_2 = fdvar_upper_bound fdvar2

    ASSERT_DOMAIN_EMPTY_CHECK fdvar1.dom
    ASSERT_DOMAIN_EMPTY_CHECK fdvar2.dom

    # every number in v1 can only be smaller than or equal to the biggest
    # value in v2. bigger values will never satisfy lt so prune them.
    if hi_1 >= hi_2
      left_changed = fdvar_remove_gte_inline fdvar1, hi_2
      if fdvar_is_rejected fdvar1
        left_changed = REJECTED

    # likewise; numbers in v2 that are smaller than or equal to the
    # smallest value of v1 can never satisfy lt so prune them as well
    if lo_1 >= lo_2
      right_changed = fdvar_remove_lte_inline fdvar2, lo_1
      if fdvar_is_rejected fdvar2
        right_changed = REJECTED

    return left_changed or right_changed or ZERO_CHANGES

  # lt would reject if all elements in the left var are bigger or equal to
  # the right var. And since everything is CSIS, we only have to check the
  # lo bound of left to the high bound of right for that answer.
  # Read-only check

  lt_step_would_reject = (fdvar1, fdvar2) ->
    dom1 = fdvar1.dom
    dom2 = fdvar2.dom

    ASSERT_DOMAIN_EMPTY_CHECK dom1
    ASSERT_DOMAIN_EMPTY_CHECK dom2
#    if domain_is_rejected dom1 or domain_is_rejected dom2
#      return true

    return domain_min(dom1) >= domain_max(dom2)

  FD.propagators.lt_step_bare = lt_step_bare
  FD.propagators.lt_step_would_reject = lt_step_would_reject
