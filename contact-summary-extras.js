const {
    DAYS_IN_YEAR,
    getField,
    now,
    PNC_PERIOD_DAYS,
    getNewestReport,
    getDaysPast,
    getYearsPast,
    antenatalForms,
    deliveryForms,
    pregnancyForms,
    getCurrentEdd,
    isPregnant,
    getFpExpiryDate,
    getMostRecentEnrollment,
    getTreatmentDuration,
    getNextImmDate,
    isUsingFPService,
    isAlive,
    getAppointmentDateFromLastTraceReport,
    getTraceReasonsFromLastTraceReport,
    getSubsequentTraceReports,
    getFPMethodSubscription
} = require('./shared');

const VACCINES = {
    bcg: 'BCG',
    birth_polio: 'Birth Polio (OPV 0)',
    opv_1: 'OPV 1',
    opv_2: 'OPV 2',
    opv_3: 'OPV 3',
    pcv_1: 'PCV 1',
    pcv_2: 'PCV 2',
    pcv_3: 'PCV 3',
    dpt_hepb_hib_1: 'DPT-HepB-Hib 1',
    dpt_hepb_hib_2: 'DPT-HepB-Hib 2',
    dpt_hepb_hib_3: 'DPT-HepB-Hib 3',
    ipv: 'IPV',
    rota_1: 'Rota 1',
    rota_2: 'Rota 2',
    vitamin_a: 'Vitamin A',
    measles_1: 'Measles 1',
    measles_2: 'Measles 2'
};

const FAMILY_PLANNING_METHODS = {
    pills: 'Pills',
    iucd: 'Intrauterine Device (IUCD)',
    implant: 'Implant',
    tubal_ligation: 'Tubal Ligation',
    depo_provera: 'Injection/Depo-Provera'
};

const NCDS = {
    hypertension: 'Hypertension',
    asthma: 'Asthma/chronic lung disease',
    diabetes: 'Diabetes',
    epilepsy: 'Epilepsy',
    mental_health: 'Mental health',
    heart_failure: 'Heart failure',
    other: 'Other'
};

const getTreatmentEnrollmentDate = (contact, reports, program) => {
    // ToDo: Check enrolment date from contact too
    let date = '';
    const enrollment_report = getMostRecentEnrollment(contact, reports, program).enrollment;
    if (enrollment_report){
      const d = new Date(0);
      d.setUTCSeconds(enrollment_report.reported_date/1000);
      date = d.toISOString().slice(0, 10);
    }
    return date;
};

const getNcds = (contact, reports, program) => {
    const enrollment_report = getMostRecentEnrollment(contact, reports, program).enrollment;
    let ncds = [];
    let other_ncds = [];
    if (enrollment_report) {
      let ncd = '', others = '';
      switch (enrollment_report.form) {
        case 'over_5_screening':
          ncd = getField(enrollment_report, 'ncd_screening.ncds');
          others = getField(enrollment_report, 'ncd_screening.ncds_other');
          break;
        case 'treatment_enrolment':
          ncd = getField(enrollment_report, 'treatment_program_details.ncds');
          others = getField(enrollment_report, 'treatment_program_details.ncds_other');
          break;
        case 'referral_follow_up':
          ncd = getField(enrollment_report, 'ncds.other_ncds');
          others = getField(enrollment_report, 'ncds.other_ncds_other');
          break;
        default:
          ncd = enrollment_report.ncds;
          others = enrollment_report.ncds_other;
          break;
      }

      ncds = extractNcds(ncd);
      if (others) {
        ncds = ncds.filter(item => item !== 'Other');
        other_ncds = 'Other - ' + others;
      }
    }
    ncds = Array.from(new Set(ncds.concat(other_ncds)));
    return ncds;
};
// Function to get the appointment date from last visit
// @args: reports array
// @return: next appointment date from last under_5_screening
const getAppointmentDateFromLastVisit = reports => {
    let appointment_date = '';
    const screenings = reports.filter(function (r) {
        return r.form === 'under_5_screening';
    });
    if (screenings.length > 0) {
        const mostRecentScreening = getNewestReport(screenings, ['under_5_screening']);
        appointment_date = mostRecentScreening.fields && mostRecentScreening.fields.vaccines_given?mostRecentScreening.fields.vaccines_given.next_visit:'';
    }
    return appointment_date;
};

const extractVaccinations = (record) => record.split(' ').map((item) => VACCINES[item]);
const extractNcds = (record) => record.split(' ').map((item) => NCDS[item]);
// Function to check that a vaccine and dose was given
// @return: true/false
const getVaccinesReceived = reports => {
    let vaccinations = [];
    reports.forEach((report) => {
        if (report.form === 'immunization') {
            const immunizations = getField(report, 'vaccines');
            if (immunizations) {
                vaccinations = vaccinations.concat(extractVaccinations(immunizations));
            }
        }
    });
    vaccinations = Array.from(new Set(vaccinations));
    return vaccinations;
};
// Function to get the formatted date - 'dd/mm/yyyy'
// @args: date string
// @return: formatted date
const getFormattedDate = dateString => {
    if(dateString &&  dateString !=='unknown'){
        const intlDate = new Date(dateString);
        dateString = ('0' + intlDate.getDate()).slice(-2) + '/' + ('0' + (intlDate.getMonth()+1)).slice(-2) + '/' + intlDate.getFullYear();
    }
    return dateString;
};

const getDaysSinceDelivery = reports => {
    const report = getNewestReport(reports, deliveryForms);
    if (report) {
        return getDaysPast(new Date(), new Date(getField(report, 'delivery_date')));
    }
    return -1;
};
const isPncPeriod = reports => {
    return getDaysSinceDelivery(reports) >= 0 && getDaysSinceDelivery(reports) <= PNC_PERIOD_DAYS;
};

const getANCVisitsCount = reports => {
    const pregnancy = getNewestReport(reports, pregnancyForms);
    if (pregnancy){
      const ancVisits = reports.filter(r => {
        return antenatalForms.includes(r.form) &&
          getField(r, 'pregnancy_id') === pregnancy._id &&
          getField(r, 'pregnancy_status.still_pregnant') === 'yes' &&
          getField(r, 'visit_details.attended') === 'yes';
      });
      const priorANCvisits = parseInt(getField(pregnancy, 'anc_visits'));
      return isNaN(priorANCvisits) ? ancVisits.length : ancVisits.length + priorANCvisits;
    }
    return 0;
};

const getTreatmentProgramId = (contact, reports, condition) => {
    let id = '';
    const enrollment = getMostRecentEnrollment(contact, reports, condition).enrollment;
    if (enrollment){
      if (enrollment.type === 'data_record' && enrollment.form === 'referral_follow_up'){
        if(condition.includes('eid')){
          id = getField(enrollment, 'eid.eid_id');
        }else if(condition.includes('art')){
          id = getField(enrollment, 'hiv.art_id');
        }else if(condition.includes('ncd')){
          id = getField(enrollment, 'ncds.ncd_id');
        }
      } else if (enrollment.type === 'data_record' && enrollment.form === 'treatment_enrolment'){
        if(condition.includes('eid')){
          id = getField(enrollment, 'treatment_program_details.eid_id');
        }else if(condition.includes('art')){
          id = getField(enrollment, 'treatment_program_details.art_id');
        }else if(condition.includes('ncd')){
          id = getField(enrollment, 'treatment_program_details.ncd_id');
        }
      } else if (enrollment.type === 'data_record' && enrollment.form === 'hiv_screening'){
        id = getField(enrollment, 'art_id');
      } else if (enrollment.type === 'data_record' && enrollment.form === 'over_5_screening'){
        id = getField(enrollment, 'ncd_screening.ncd_id');
      } else if (enrollment.type === 'contact') {
        if(condition.includes('eid')){
          id = enrollment.eid_id;
        }else if(condition.includes('art')){
          id = enrollment.art_id;
        }else if(condition.includes('ncd')){
          id = enrollment.ncd_id;
        }
      }
      // avoid returning default ID suffix as treatment ID
      if (condition.includes('ncd') && id.trim() === 'CCC'){
        id = '';
      }
    }
    return id;
};

const isContactTraceReferred = reports => {
    const visits = reports.filter(function (r) {
        return r.form === 'tb_home_visit' && getField(r, 'contact_tracing.referred');
    });
    const visit = getNewestReport(visits, ['tb_home_visit']);
    return visit && getField(visit, 'contact_tracing.referred') === 'yes';
};

const mostRecentPregnancy = reports => getNewestReport(reports, ['pregnancy']);

const getLmpFromPregnancy = reports => getField(mostRecentPregnancy(reports), 'fields.c_lmp_date');

const getNewestPregnancyId = reports => mostRecentPregnancy(reports) ? mostRecentPregnancy(reports)['_id'] : '';

const lastTbResults = reports => getNewestReport(reports, ['tb_results'])?getField(getNewestReport(reports, ['tb_results']), 'fields.tb_results.results'):'';

const isOfChildBearingAge = (contact) => {
    const ageInYears = getYearsPast(new Date(contact.date_of_birth), new Date(now));
    return contact.sex === 'female' && ageInYears >= 15 && ageInYears <= 49;
};

const isFullyImmunized = reports => {
  const completableVaccines = Object.assign({}, VACCINES);
  // birth_polio is not a must to be considered fully immunized
  // https://github.com/medic/config-pih/issues/29#issuecomment-620575824
  delete completableVaccines.birth_polio;
  return getVaccinesReceived(reports).length === Object.keys(completableVaccines).length;
};

const getTBTestResult = reports => {
  const tbResult = getNewestReport(reports, ['tb_results']);
  return tbResult && getField(tbResult, 'results') || '';
};

module.exports = {
    now,
    DAYS_IN_YEAR,
    getYearsPast,
    isOfChildBearingAge,
    getCurrentEdd,
    lastTbResults,
    isPregnant,
    getANCVisitsCount,
    getLmpFromPregnancy,
    getNewestPregnancyId,
    getDaysSinceDelivery,
    getField,
    isUsingFPService,
    FAMILY_PLANNING_METHODS,
    isPncPeriod,
    getFpExpiryDate,
    getFormattedDate,
    getNewestReport,
    getVaccinesReceived,
    getNextImmDate,
    VACCINES,
    getTreatmentProgramId,
    getNcds,
    getTreatmentDuration,
    isContactTraceReferred,
    getAppointmentDateFromLastVisit,
    getTreatmentEnrollmentDate,
    isAlive,
    getMostRecentEnrollment,
    getAppointmentDateFromLastTraceReport,
    getTraceReasonsFromLastTraceReport,
    getSubsequentTraceReports,
    deliveryForms,
    isFullyImmunized,
    getFPMethodSubscription,
    getTBTestResult
};
