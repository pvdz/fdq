// this is exported from the "// h w/ unbalanced tail" test in constraints.coffee in multiverse
// included because the runtime of the test regressed from immediate to to infinite

let config = {
  _class: '$config',
  varStratConfig: {
    type: 'naive',
  },
  valueStratName: 'min',
  targetedVars: 'all',
  varDistOptions: {},
  timeoutCallback: undefined,
  allVarNames: [
    '0',
    '_ROOT_BRANCH_',
    'SECTION',
    '3',
    '4',
    '5',
    '6',
    'VERSE_INDEX',
    '8',
    'ITEM_INDEX',
    '10',
    '11',
    'width',
    'color',
    'post_type',
    'state',
    'SECTION&n=1',
    'VERSE_INDEX&n=1',
    'ITEM_INDEX&n=1',
    'width&n=1',
    'color&n=1',
    'post_type&n=1',
    'state&n=1',
    'SECTION&n=2',
    'VERSE_INDEX&n=2',
    'ITEM_INDEX&n=2',
    'width&n=2',
    'color&n=2',
    'post_type&n=2',
    'state&n=2',
    'SECTION&n=3',
    'VERSE_INDEX&n=3',
    'ITEM_INDEX&n=3',
    'width&n=3',
    'color&n=3',
    'post_type&n=3',
    'state&n=3',
    'SECTION&n=4',
    'VERSE_INDEX&n=4',
    'ITEM_INDEX&n=4',
    'width&n=4',
    'color&n=4',
    'post_type&n=4',
    'state&n=4',
    'SECTION&n=5',
    'VERSE_INDEX&n=5',
    'ITEM_INDEX&n=5',
    'width&n=5',
    'color&n=5',
    'post_type&n=5',
    'state&n=5',
    'SECTION&n=6',
    'VERSE_INDEX&n=6',
    'ITEM_INDEX&n=6',
    'width&n=6',
    'color&n=6',
    'post_type&n=6',
    'state&n=6',
    '58',
    '59',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '70',
    '71',
    '72',
    '73',
    '74',
    '75',
    '76',
    '77',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
    '100',
    '101',
    '102',
    '103',
    '104',
    '105',
    '106',
    '107',
    '108',
    '109',
    '110',
    '111',
    '112',
    '113',
    '114',
    '115',
    '116',
    '117',
    '118',
    '119',
    '120',
    '121',
    '122',
    '123',
    '124',
    '125',
    '126',
    '127',
    '128',
    '129',
    '130',
    '131',
    '132',
    '133',
    '134',
    '135',
    '136',
    '137',
    '138',
    '139',
    '140',
    '141',
    '142',
    '143',
    '144',
    '145',
    '146',
    '147',
    '148',
    '149',
    '150',
    '151',
    '152',
    '153',
    '154',
    '155',
    '156',
    '157',
    '158',
    '159',
    '160',
    '161',
    '162',
    '163',
    '164',
    '165',
    '166',
    '167',
    '168',
    '169',
    '170',
    '171',
    '172',
    '173',
    '174',
    '175',
    '176',
    '177',
    '178',
    '179',
    '180',
    '181',
    '182',
    '183',
    '184',
    '185',
    '186',
    '187',
    '188',
    '189',
    '190',
    '191',
    '192',
    '193',
    '194',
    '195',
    '196',
    '197',
    '198',
    '199',
    '200',
    '201',
    '202',
    '203',
    '204',
    '205',
    '206',
    '207',
    '208',
    '209',
    '210',
    '211',
    '212',
    '213',
    '214',
    '215',
    '216',
    '217',
    '218',
    '219',
    '220',
    '221',
    '222',
    '223',
    '224',
    '225',
    '226',
    '227',
    '228',
    '229',
    '230',
    '231',
    '232',
    '233',
    '234',
    '235',
    '236',
    '237',
    '238',
    '239',
    '240',
    '241',
    '242',
    '243',
    '244',
    '245',
    '246',
    '247',
    '248',
    '249',
    '250',
    '251',
    '252',
    '253',
    '254',
    '255',
    '256',
    '257',
    '258',
    '259',
    '260',
    '261',
    '262',
    '263',
    '264',
    '265',
    '266',
    '267',
    '268',
    '269',
    '270',
    '271',
    '272',
    '273',
    '274'],
  allConstraints: [
    /*
varIndex= 0 domain= [ 1, 1 ]
varIndex= 8 domain= [ 3, 3 ]
varIndex= 160 domain= [ 0, 1 ]
varIndex= 168 domain= [ 0, 1 ]
varIndex= 169 domain= [ 0, 1 ]
varIndex= 170 domain= [ 0, 1 ]
varIndex= 173 domain= [ 0, 100000000 ]
varIndex= 174 domain= [ 0, 1 ]
varIndex= 179 domain= [ 0, 100000000 ]
varIndex= 180 domain= [ 0, 1 ]
varIndex= 203 domain= [ 0, 100000000 ]
varIndex= 204 domain= [ 0, 1 ]
varIndex= 261 domain= [ 0, 1 ]
*/
    // constraint_isSolved must be smarter than just going off on whether its vars are solved. at least some do.
    {_class: '$constraint', name: 'reifier', varIndexes: [173, 8, 174], param: 'eq'},
    {_class: '$constraint', name: 'sum', varIndexes: [168, 169, 170], param: 179},
    {_class: '$constraint', name: 'reifier', varIndexes: [179, 8, 180], param: 'eq'},
    {_class: '$constraint', name: 'sum', varIndexes: [160, 180], param: 203},
    {_class: '$constraint', name: 'reifier', varIndexes: [203, 0, 204], param: 'gte'},
    {_class: '$constraint', name: 'sum', varIndexes: [261, 204], param: 3},
  ],
  constantCache: {
    '0': '163',
    '1': '0',
    '2': '3',
    '3': '8',
    '4': '4',
    '5': '5',
    '6': '10',
    '7': '6',
    '8': '11',
  },
  initialDomains: [
    [1, 1],
    [0, 1],
    [1, 1],
    [2, 2],
    [4, 4],
    [5, 5],
    [7, 7],
    [1, 2, 4, 5, 7, 7],
    [3, 3],
    [1, 5],
    [6, 6],
    [8, 8],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [1, 2, 4, 7],
    [1, 6],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [1, 7],
    [1, 7],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [1, 7],
    [1, 7],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [1, 7],
    [1, 7],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [1, 3, 5, 7],
    [2, 7],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 1],
    [2, 3, 5, 7],
    [3, 7],
    [1, 8],
    [1, 2],
    [1, 2],
    [1, 2],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 0],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 100000000],
    [0, 100000000],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
    [0, 100000000],
    [0, 1],
  ],
};

export default config;
