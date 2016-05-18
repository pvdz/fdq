// Config for a search tree where each node is a Space
// TOFIX: may want to rename this to "tree-state" or something; it's not just config

import {
  EMPTY,
  MAX_SMALL,
  SUB,
  SUP,

  ASSERT,
  THROW,
} from './helpers';
import {
  fdvar_create,
} from './fdvar';
import {
  domain_createRange,
} from './domain';
import distribution_getDefaults from './distribution/defaults';

// BODY_START

function config_create() {
  return {
    _class: 'config',

    var_filter_func: 'unsolved',
    next_var_func: 'naive',
    next_value_func: 'min',
    targetedVars: 'all',
    var_dist_options: {},
    timeout_callback: undefined,

    // "solved" values should be shared with the tree. may refactor this away in the future.
    constant_uid: 0,
    constant_cache: {}, // value to var.id, usually anonymous

    // names of all vars in this search tree
    // optimizes loops because `for-in` is super slow
    all_var_names: [],

    // like a blue print for the root space with just primitives/arrays
    initial_vars: {},
    propagators: [],
  };
}

function config_clone(config, newVars) {
  ASSERT(config._class = 'config');

  let {
    var_filter_func,
    next_var_func,
    next_value_func,
    targetedVars,
    var_dist_options,
    timeout_callback,
    constant_uid,
    constant_cache,
    all_var_names,
    initial_vars,
    propagators,
  } = config;

  return {
    _class: 'config',

    var_filter_func,
    next_var_func,
    next_value_func,
    targetedVars: (targetedVars instanceof Array && targetedVars.slice(0)) || targetedVars,
    var_dist_options: JSON.parse(JSON.stringify(var_dist_options)),  // TOFIX: clone this more efficiently
    timeout_callback, // by reference because it's a function if passed on...

    constant_uid,
    constant_cache, // is by reference ok?

    all_var_names: all_var_names.slice(0),

    initial_vars: newVars || initial_vars,
    propagators: propagators.slice(0), // is it okay to share them by ref? i think so...
  };
}

/**
 * Add an anonymous var with max allowed range
 *
 * @param {$config} config
 * @returns {string}
 */
function config_addVarAnonNothing(config) {
  let name = String(++config.constant_uid);
  config_addVarNothing(config, name);
  return name;
}
/**
 * @param {$config} config
 * @param {string} name
 * @returns {string}
 */
function config_addVarNothing(config, name) {
  config_addVarDomain(config, name, domain_createRange(SUB, SUP));
  return name;
}
/**
 * @param {$config} config
 * @param {number} lo
 * @param {number} hi
 * @returns {string}
 */
function config_addVarAnonRange(config, lo, hi) {
  ASSERT(config._class === 'config');
  ASSERT(typeof lo === 'number', 'lo value must be a number', lo);
  ASSERT(typeof hi === 'number', 'hi value must be a number', hi);

  if (lo === hi) return config_addVarAnonConstant(config, lo);

  let name = String(++config.constant_uid);
  config_addVarRange(config, name, lo, hi);

  return name;
}
/**
 * @param {$config} config
 * @param {string} name
 * @param {number} lo
 * @param {number} hi
 * @returns {string}
 */
function config_addVarRange(config, name, lo, hi) {
  ASSERT(config._class === 'config');
  ASSERT(typeof name === 'string', 'name must be a string');
  ASSERT(typeof lo === 'number', 'lo value must be a number', lo);
  ASSERT(typeof hi === 'number', 'hi value must be a number', hi);
  ASSERT(lo <= hi, 'range should be lo<=hi', lo, hi);

  let domain = domain_createRange(lo, hi);
  config_addVarDomain(config, name, domain);

  return name;
}
/**
 * @param {$config} config
 * @param {string[]} names
 * @param {$domain} domain
 */
function config_addVarsWithDomain(config, names, domain) {
  ASSERT(config._class === 'config');

  for (let i = 0, n = names.length; i < n; ++i) {
    let name = names[i];
    ASSERT(typeof name === 'string', 'name must be a string');
    config_addVarDomain(config, name, domain);
  }
}
/**
 * @param {$config} config
 * @param {string} name
 * @param {$domain} domain
 * @param {undefined} [_forbidden] Throws if this is used, prevents bad api mistakes (since domain can be a number)
 * @returns {string}
 */
function config_addVarDomain(config, name, domain, _forbidden) {
  ASSERT(_forbidden === undefined, 'WRONG_API');

  _config_addVar(config, name, domain);
  return name;
}
/**
 * @param {$config} config
 * @param {number} value
 * @returns {string}
 */
function config_addVarAnonConstant(config, value) {
  ASSERT(config._class === 'config');
  ASSERT(typeof value === 'number', 'value should be a number', value);

  if (config.constant_cache[value]) {
    return config.constant_cache[value];
  }

  let name = String(++config.constant_uid);
  config_addVarConstant(config, name, value);

  return name;
}
/**
 * @param {$config} config
 * @param {string} name
 * @param {number} value
 * @returns {string}
 */
function config_addVarConstant(config, name, value) {
  ASSERT(config._class === 'config');
  ASSERT(typeof name === 'string', 'name must be a string');
  ASSERT(typeof value === 'number', 'value should be a number', value);

  let domain = domain_createRange(value, value);

  config_addVarDomain(config, name, domain);

  config.constant_cache[value] = name;

  return name;
}

/**
 * @param {$config} config
 * @param {string} name
 * @param {$domain} domain
 */
function _config_addVar(config, name, domain) {
  ASSERT(config._class === 'config', 'EXPECTING_CONFIG');
  ASSERT(name && typeof name === 'string', 'name must be a non-empty string');
  ASSERT(typeof domain === 'number' || domain instanceof Array, '$domain is a number or array', domain);
  ASSERT(!config.initial_vars[name], 'Do not declare the same name twice', config.initial_vars[name], '->', name, '->', domain);
  ASSERT(!(domain instanceof Array) || domain.length === 0 || domain[0] >= SUB, 'domain lo should be >= SUB', domain);
  ASSERT(!(domain instanceof Array) || domain.length === 0 || domain[domain.length - 1] <= SUP, 'domain hi should be <= SUP', domain);
  ASSERT(typeof domain !== 'number' || (domain >= EMPTY && domain <= MAX_SMALL), 'domain as value should be within small domain range', domain);

  if (config.all_var_names.indexOf(name) >= 0) THROW('Var name already part of this config. Probably a bug?');

  //domain = domain_maim(domain);

  config.initial_vars[name] = domain;
  config.all_var_names.push(name);
}

/**
 * Initialize the config of this space according to certain presets
 *
 * @param {Space} space
 * @param {string} name
 */
function config_setDefaults(space, name) {
  ASSERT(space._class === 'config');
  config_setOptions(space, distribution_getDefaults(name));
}

// Set solving options on this config. Only required for the root.

function config_setOptions(config, options) {
  ASSERT(config._class === 'config');
  if (options && options.filter) {
    // for markov,
    // string: 'none', ignored
    // function: callback to determine which vars of a space are considered, should return array of names
    config.var_filter_func = options.filter;
  }
  if (options && options.var) {
    // see distribution.var
    // either
    // - a function: should return the _name_ of the next var to process
    // - a string: the name of the var distributor to use
    // - an object: a complex object like {dist_name:string, fallback_config: string|object, data...?}
    // fallback_config has the same struct as the main config.next_var_func and is used when the dist returns SAME
    // this way you can chain distributors if they cant decide on their own (list -> markov -> naive)
    config.next_var_func = options.var;
    config_initConfigsAndFallbacks(options.var);
  }
  if (options && options.val) {
    // see distribution.value
    config.next_value_func = options.val;
  }
  if (options && options.targeted_var_names) {
    // which vars must be solved for this space to be solved
    // string: 'all'
    // string[]: list of vars that must be solved
    // function: callback to return list of names to be solved
    config.targetedVars = options.targeted_var_names;
  }
  if (options && options.var_dist_config) {
    // An object which defines a value distributor per variable
    // which overrides the globally set value distributor.
    // See Bvar#distributionOptions (in multiverse)
    config.var_dist_options = options.var_dist_config;
  }
  if (options && options.timeout_callback) {
    // A function that returns true if the current search should stop
    // Can be called multiple times after the search is stopped, should
    // keep returning false (or assume an uncertain outcome).
    // The function is called after the first batch of propagators is
    // called so it won't immediately stop. But it stops quickly.
    config.timeout_callback = options.timeout_callback;
  }
}

function config_addPropagator(config, propagator) {
  ASSERT(config._class === 'config');
  config.propagators.push(propagator);
}

// TOFIX: config_getUnknownVars was not exported but imported in Solver. is it used at all? i dont think so.
function config_getUnknownVars(config) {
  let names = [];
  for (let i = 0; i < config.propagators.length; i++) {
    let p = config.propagators[i];
    let a = p[1][0];
    if (!config.initial_vars[a] && names.indexOf(a) < 0) {
      names.push(a);
    }
    let b = p[1][1];
    if (!config.initial_vars[b] && names.indexOf(b) < 0) {
      names.push(b);
    }
  }
  return names;
}

function config_generateVars(config, vars = {}, unsolvedVarNames) {
  ASSERT(config, 'should have a config');
  let initialVars = config.initial_vars;
  ASSERT(initialVars, 'config should have initial vars');
  let allVarNames = config.all_var_names;
  ASSERT(allVarNames, 'config should have a list of vars');

  for (let i = 0; i < allVarNames.length; i++) {
    let name = allVarNames[i];
    let val = initialVars[name];
    if (typeof val === 'number') {
      // NOT a constant (anymore), but a "small domain"; bit flags
      val = fdvar_create(name, val);
    } else if (val === undefined) {
      val = fdvar_create(name, domain_createRange(SUB, SUP));
    } else {
      ASSERT(val instanceof Array);
      ASSERT((val.length % 2) === 0);
      val = fdvar_create(name, val);
    }

    vars[name] = val;
    if (unsolvedVarNames && val.length !== 2 || val[0] !== val[1]) {
      unsolvedVarNames.push(name);
    }
  }

  return vars;
}

/**
 * Create a simple lookup hash from an array of strings
 * to an object that looks up the index from the string.
 * This is used for finding the priority of a var elsewhere.
 *
 * @param {$config} [config] This is the var dist config (-> space.config.next_var_func)
 * @property {string[]} [config.priority_list] If present, creates a priority_hash on config which maps string>index
 */
function config_initConfigsAndFallbacks(config) {
  // populate the priority hashes for all (sub)configs
  while (config != null) {
    // explicit list of priorities. vars not in this list have equal
    // priority, but lower than any var that is in the list.
    let list = config.priority_list;
    if (list) {
      let hash = {};
      config.priority_hash = hash;
      for (let index = 0, max = list.length; index < max; index++) {
        // note: lowest priority still in the list is one, not zero
        // this way you dont have to check -1 for non-existing, later
        let name = list[index];
        hash[name] = max - index;
      }
    }

    // do it for all the fallback configs as well...
    config = config.fallback_config;
  }
}

// BODY_STOP

export {
  config_addPropagator,
  config_addVarAnonConstant,
  config_addVarAnonNothing,
  config_addVarAnonRange,
  config_addVarConstant,
  config_addVarDomain,
  config_addVarNothing,
  config_addVarRange,
  config_addVarsWithDomain,
  config_clone,
  config_create,
  config_generateVars,
  config_getUnknownVars,
  config_setDefaults,
  config_setOptions,

  // testing
  _config_addVar,
  config_initConfigsAndFallbacks,
};