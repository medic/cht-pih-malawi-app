const {
  isFullyImmunized,
  getTreatmentProgramId
} = require('../../contact-summary-extras');
const assert = require('chai').assert;

const report_1 = {
  '_id': 'report_1',
  'fields': {
    'vaccines': 'bcg opv_1 opv_2 opv_3 pcv_1 pcv_2 pcv_3 dpt_hepb_hib_1 dpt_hepb_hib_2 dpt_hepb_hib_3 ipv rota_1 rota_2 vitamin_a measles_1 measles_2',
  },
  'form': 'immunization'
};

const report_2 = {
  '_id': 'report_2',
  'fields': {
    'vaccines': 'bcg opv_2 opv_3 pcv_1 pcv_2 pcv_3 dpt_hepb_hib_1 dpt_hepb_hib_2 dpt_hepb_hib_3 ipv rota_1 rota_2 vitamin_a measles_1 measles_2',
  },
  'form': 'immunization'
};

describe('isFullyImmunized function', function(){

  it('should return true if patient has completed all vaccines', function(){

    assert.isTrue(isFullyImmunized([report_1]));

  });

  it('should return false if patient has not completed all vaccines', function(){

    assert.isFalse(isFullyImmunized([report_2]));

  });

});

describe('getTreatmentProgramId function', function(){

  it('should return relevant condition id from referral_follow_up form', function(){

    const r1 = {
      form: 'referral_follow_up',
      type: 'data_record',
      fields: {
        hiv: {
          initiated_treatment: 'yes',
          art_id: 'TEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r1], ['art']), 'TEST');

    const r2 = {
      form: 'referral_follow_up',
      type: 'data_record',
      fields: {
        eid: {
          enrolled_in_eid: 'yes',
          eid_id: 'EIDTEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r2], ['eid']), 'EIDTEST');

    const r3 = {
      form: 'referral_follow_up',
      type: 'data_record',
      fields: {
        ncds: {
          ncd_confirmed: 'yes',
          ncd_id: 'NCDTEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r3], ['ncd']), 'NCDTEST');
  });

  it('should return relevant condition id from treatment_enrolment form', function(){
    const r4 = {
      form: 'treatment_enrolment',
      type: 'data_record',
      fields: {
        treatment_program_details: {
          treatment_enrolment: 'eid',
          eid_id: 'TEIDTEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r4], ['eid']), 'TEIDTEST');

    const r5 = {
      form: 'treatment_enrolment',
      type: 'data_record',
      fields: {
        treatment_program_details: {
          treatment_enrolment: 'ncd',
          ncd_id: 'TNCDTEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r5], ['ncd']), 'TNCDTEST');

    const r6 = {
      form: 'treatment_enrolment',
      type: 'data_record',
      fields: {
        treatment_program_details: {
          treatment_enrolment: 'art',
          art_id: 'TARTTEST'
        }
      }
    };
    assert.equal(getTreatmentProgramId({}, [r6], ['art']), 'TARTTEST');
  });

  it('should return relevant condition id from contact', function(){
    const c1 = {
      type: 'contact',
      conditions: 'art',
      art_id: 'CARTTEST'
    };
    assert.equal(getTreatmentProgramId(c1, [], ['art']), 'CARTTEST');

    const c2 = {
      type: 'contact',
      conditions: 'eid',
      eid_id: 'CEIDTEST'
    };
    assert.equal(getTreatmentProgramId(c2, [], ['eid']), 'CEIDTEST');

    const c3 = {
      type: 'contact',
      conditions: 'ncd',
      ncd_id: 'CNCDTEST'
    };
    assert.equal(getTreatmentProgramId(c3, [], ['ncd']), 'CNCDTEST');
  });

});
