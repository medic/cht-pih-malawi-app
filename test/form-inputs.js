const { DateTime, Duration } = require('luxon');
const NOW = DateTime.local();

module.exports = {

  contact: {
    under_5: [
      'Test',
      'male',
      'under_5',
      NOW.minus(Duration.fromObject({ years: 1 })).toISODate(),
      ['eid'],
      'no'
    ],
    over_5: [
      'Newly Adopted',
      'male',
      'over_5',
      'yes',
      '2000-01-01',
      '',
      '',
      'ncd',
      'asthma',
      'no'
    ],
    over_5_female_art: [
      'Test',
      'female',
      'over_5', 'yes',
      '1979-01-01',
      '',
      '',
      'art',
      'no',
      '2',
      ''
    ],
  },

  unmuteHouseholdScenarios: {
    notOther: [
      ['accepted_service']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  muteHouseholdScenarios: {
    notOther: [
      ['refused_service']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  unmuteScenarios: {
    notOther: [
      ['moved_back']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  muteScenarios: {
    notOther: [
      ['moved_temporarily']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  unmuteCHWAreaScenarios: {
    notOther: [
      ['services_restarted']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  muteCHWAreaScenarios: {
    notOther: [
      ['moved_temporarily']
    ],
    other: [
      ['other', 'unspecified']
    ],
  },

  over_5_screening: {
    tb_symptoms: [
      [],
      [],
      ['no', 'cough'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['na'],
      ['no']
    ],
    tb_program: [
      [],
      [],
      ['yes', 'yes'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['na'],
      ['no']
    ],
    simple: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['no', 'no', 'no', '3', 'yes'],
      ['no'],
      ['no']
    ],
    fp_subscription: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'iucd', '2017-12-15', 'no'],
      ['no']
    ],
    ncd_symptom: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'wheezing'],
      ['no'],
      ['na'],
      ['no'],
      ['no']
    ],
    ncd_asthma_no_emr: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['yes', 'asthma', 'no'],
      ['no'],
      ['na'],
      ['no']
    ],
    ncd_asthma_emr: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['yes', 'asthma', 'yes', 'self', 'NNO', '1234'],
      ['no'],
      ['na'],
      ['no']
    ],
    over_5_screening_pregnant: (lastLmpDate) => [
      [],
      [],
      ['no', 'none'],
      ['no', '0'],
      ['no', 'none'],
      ['yes'],
      ['yes', lastLmpDate, '0', 'none'],
      ['no'],
      ['yes', 'chw']
    ],
    pregnant_no_anc_vist: [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['yes'],
      ['no', '3', '0', 'none'],
      ['no'],
      ['yes', 'chw']
    ],
    pregnant_no_anc_vist_art: [
      [],
      [],
      ['no', 'none'],
      ['no', 'none'],
      ['yes'],
      ['no', '3', '0', 'none'],
      ['no'],
      ['no']
    ],
    pregnant_1_anc_vist: (anc_visit_date, edd, next_anc_visit) => [
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['yes'],
      ['no', '3', '1', anc_visit_date, edd, next_anc_visit, 'none'],
      ['no']
    ],
    hiv_never_tested: [
      [],
      [],
      ['no', 'none'],
      ['no', '0'],
      ['no', 'none'],
      ['no'],
      ['na'],
      ['no'],
      ['no']
    ],
    hiv_tested_4_months_ago: [
      [],
      [],
      ['no', 'none'],
      ['no', '4'],
      ['no', 'none'],
      ['no'],
      ['na'],
      ['no'],
      ['no']
    ],
  },

  referral_follow_up: {
    tb_no_treatment: [
      ['yes'],
      ['no'],
      ['no']
    ],
    nothing_confirmed: [
      ['yes'],
      ['no'],
      ['no']
    ],
    ncd_asthma_no_emr: [
      ['yes'],
      ['yes', 'asthma', 'yes', 'no'],
      ['no']
    ],
    ncd_epilepsy_emr: [
      ['yes'],
      ['yes', 'epilepsy', 'yes', 'yes', 'self', 'NNO', '1234'],
      ['no']
    ],
    malnutrition: [
      ['yes'],
      ['no'],
      ['no']
    ],
    eid: [
      ['yes'],
      ['yes', 'no'],
      ['no']
    ],
    hiv_test: [
      ['yes'],
      ['yes', 'negative'],
      ['no']
    ]
  },

  monthly_follow_up: {
    simple: [
      [],
      [],
      ['yes', 'yes', 'none', 'no']
    ],
    cured: [
      [],
      [],
      ['no', 'yes'],
      ['cured'],
      ['no', 'no']
    ],
    delivered: (deliveryDate) => [
      [],
      [],
      ['no', 'delivered'],
      [deliveryDate, 'facility', 'no'],
      [1, 1],
      ['Name', 'male'],
    ]
  },

  treatment_enrollment: {
    hypertension: [
      ['ncd', 'hypertension', 'yes', 'self', 'NNO', '1234']
    ]
  },

  under_5_screening: {
    malnutrition_symptoms: [
      [],
      [],
      ['no', '13', 'wasting'],
      ['none'],
      [],
      ['no'],
      ['not_scheduled'],
      ['no'],
      ['no']
    ],
    malnutrition_enrollment: [
      [],
      [],
      ['yes', 'sfp', 'yes'],
      ['none'],
      [],
      ['no'],
      ['not_scheduled'],
      ['no'],
      ['no']
    ],
    immunization_visit: [
      [],
      [],
      ['no', '15', 'none'],
      ['none'],
      [],
      ['yes'],
      ['1'],
      [NOW.minus(Duration.fromObject({ days: 10 })).toString().slice(0, 10), 'bcg,opv_1,pcv_1,dpt_hepb_hib_1,ipv,rota_1,vitamin_a,measles_1'],
      [NOW.plus(Duration.fromObject({ days: 10 })).toString().slice(0, 10)],
      ['no'],
      ['no']
    ]
  },

  death: {
    no_treatment: ['2020-12-31', 'none', 'health_facility'],
    review: ['yes', '2020-12-31', 'health_facility']
  },

  spot_check: {
    needs_mentorship: ['000', 'yes', '2020-02', 'no', ...Array(10).fill('no'), '60']
  },

  dailyFollowUpScenarios: {
    hivHomeVisit: [
      ['in_person'],
      []
    ],
  },

  sputum_collection: {
    sample: ['1', '1']
  },

  householdSurveyScenarios: {
    surveyWithNoOther: [
      [],
      ['household_member', 'client_household'],
      ['earth', 'thatch'],
      ['television'],
      ['yes'],
      ['wood'],
      ['spring', 'under_30', 'boiling', 'flush_toilet', 'no', 'yes', 'no'],
      ['yes', 'no'],
      ['no', 'very_comfortable', 'yes', 'yes', 'vehicle', 'under_30', '3', '2', 'yes', 'no', 'all', 'yes', 'agree', 'strongly_agree', 'agree', 'strongly_agree'],
      ['yes', 'home', 'same'],
      ['yes']
    ],
    surveyWithOther: [
      [],
      ['household_member', 'client_household'],
      ['other', 'another', 'other', 'another'],
      ['none'],
      ['yes'],
      ['other', 'another'],
      ['other', 'another', 'under_30', 'other', 'another', 'other', 'another', 'no'],
      ['yes', 'no'],
      ['no', 'very_comfortable', 'yes', 'yes', 'vehicle', 'under_30', '3', '2', 'yes', 'no', 'all', 'yes', 'agree', 'strongly_agree', 'agree', 'strongly_agree'],
      ['yes', 'home', 'same'],
      ['yes']
    ]
  },

  tbResultsTaskScenarios: {
    referred: [
      ['yes', 'chw']
    ],
    notReferred: [
      ['no']
    ],
  },

  tbContactTracingScenarios: {
    referred: [
      ['yes']
    ],
    notReferred: [
      ['no']
    ],
  },

  traceFollowUpScenarios: {
    visited: [
      ['yes', 'visited', 'fine', 'food', 'yes', '2021-12-01', 'good', '10', '', '2021-12-01']
    ],
    moved: [
      ['no', 'moved', '2000-01-01']
    ],
    travelled: [
      ['yes', 'traveled', 'Blantyre']
    ],
    forgot: [
      ['yes', 'missed_appointment', 'fine', 'food', 'yes', '2021-12-01', 'good', '10', '', '2021-12-01']
    ]
  },

  dischargeInstructionsScenarios: {
    conveyed: [
      ['yes']
    ],
    notConveyed: [
      ['no']
    ],
  },

  deathScenarios: {
    notOther: [
      ['2020-03-01', 'none', 'health_facility']
    ],
    other: [
      ['2020-03-01', 'other', 'example other', 'outside_health_facility']
    ],
  },

  visitVerificationScenarios: {
    art: [
      ['art', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['pregnant', 'yes', 'no', '100', '2', '0p', '23', 'patient', '21', '4', '300', '1000']
    ],
    diabetes: [
      ['ncd', 'diabetes_hypertension', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['10', '20', '30', 'fasting', 'captopril', '10']
    ],
    chronic_lung: [
      ['ncd', 'chronic_lung_disease', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['yes', 'intermittent', 'no', 'salbutamol', '10']
    ],
    epilepsy: [
      ['ncd', 'epilepsy', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['2', 'phenytoin', '10']
    ],
    mental_health: [
      ['ncd', 'mental_health', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['yes', 'clopixol', '10']
    ],
    mental_health_other: [
      ['ncd', 'mental_health', '2000-03-05', '34', '67', 'no', '2021-12-01'],
      ['yes', 'other', 'asprin', '10']
    ]
  },

  traceScenarios: {
    immediately: [
      ['lab_results', 'immediately']
    ],
    next_clinic: [
      ['other', 'some text', 'ic3_clinic_date', '2021-12-01']
    ]
  },

  delivery: {
    onechild: (deliveryDate) => [
      [deliveryDate, 'facility', 'no'],
      [1, 1],
      ['Test Child', 'male']
    ],
    eid: (deliveryDate) => [
      [deliveryDate, 'facility', 'no'],
      [1, 1],
      ['Test Child', 'male', 'yes', 'chw']
    ]
  },

  delivery_check: {
    delivered: (deliveryDate) =>
      [
        ['no', 'delivered'],
        [deliveryDate, 'facility', 'no'],
        [1, 1],
        ['Name', 'male'],
        []
      ]
  }
};
