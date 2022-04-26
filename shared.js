const DAYS_IN_YEAR = 365;
const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
        if (prev === undefined) { return undefined; }
        return prev[fieldName];
    }, report);

const addDate = (date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    result.setUTCHours(0, 0, 0, 0);
    return result;
};

const isReportValid = function (report) {
    if (report.form && report.fields && report.reported_date) { return true; }
    return false;
};
const getDaysPast = (from, to) => Math.abs((to.getTime() - from.getTime()) / MS_IN_DAY);
const getYearsPast = (from, to) => Math.abs(getDaysPast(to, from) / DAYS_IN_YEAR);
const isDateValid = d => d instanceof Date && !isNaN(d);

const MS_IN_DAY = 24 * 60 * 60 * 1000;  // 1 day in ms
const now = new Date();
const PNC_PERIOD_DAYS = 42;
const MAX_PREGNANCY_AGE_IN_WEEKS = 44;
const DAYS_IN_WEEK = 7;
const isEligibleForTasks = (contact) => !contact.muted && !contact.deceased;

const getNewestReport = (reports = [], forms) => {
    let result = null;
    reports.forEach(function (report) {
        if (!isReportValid(report) || !forms.includes(report.form)) { return; }
        if (!result || report.reported_date > result.reported_date) {
            result = report;
        }
    });
    return result;
};

const isAlive = c => c && !c.date_of_death;
const isMuted = c => c && c.muted;

const antenatalForms = [
    'pregnancy_follow_up'
];

const deliveryForms = [
    'delivery'
];

const postnatalForms = [
    'postnatal_visit'
];

const pregnancyForms = [
    'pregnancy'
];

const enrolmentForms = [
    'referral_follow_up',
    'treatment_enrolment'
];

const fpForms = [
    'referral_follow_up',
    'fp_screening',
    'fp_follow_up'
];

const traceForms = [
    'trace'
];

const homeVisitForms = [
  'over_5_screening',
  'under_5_screening'
];

const terminatePregnancyForms = [
  ...antenatalForms,
  'delivery_check'
];

const getSubsequentDeliveries = (reports, report) => {
    return reports.filter(function(r) {
        return deliveryForms.includes(r.form) && r.reported_date > report.reported_date;
    });
};

const getSubsequentPregnancies = (reports, report) => {
    return reports.filter(function(r) {
      return pregnancyForms.indexOf(r.form) >= 0 && r.reported_date > report.reported_date;
    });
};

const hasTerminatePregnancyVisits = (reports, report) => {
    return reports.some(r => terminatePregnancyForms.includes(r.form) &&
      getField(r, 'pregnancy_status.still_pregnant') === 'no' &&
      r.reported_date > report.reported_date);
};

const getPregnancyVisits = (reports, report) => {
    return reports.filter(function(r) {
      return antenatalForms.indexOf(r.form) >= 0 && r.reported_date > report.reported_date;
    });
};

const getUpdatedEdd = (r, currentEdd) => {
    let updatedEDD = currentEdd;
    const updatedEddReports = reports.filter(function (report) {
        return report.form === 'pregnancy_follow_up' && report.reported_date > r.reported_date &&
            (getField(report, 'visit_details.update_edd') === 'yes' ||
            getField(report, 'visit_details.has_facility_edd') === 'yes');
    });
    if (updatedEddReports.length > 0) {
        const lastReportUpdate = getNewestReport(updatedEddReports, ['pregnancy_follow_up']);
        updatedEDD = getField(lastReportUpdate, 'visit_details.new_edd') ? getField(lastReportUpdate, 'visit_details.new_edd') : getField(lastReportUpdate, 'visit_details.edd');
    }
    return updatedEDD;
};

const getCurrentEdd = reports => {
    const r = getNewestReport(reports, ['pregnancy']);
    let edd = 'unknown';
    if(r){
        if (getField(r, 'edd') !== null) {
            edd = getField(r, 'edd');
        }
        // if(getField(r, 'c_lmp_date') !== null){
        //     edd = addDate(new Date(getField(r, 'c_lmp_date')), MAX_PREGNANCY_AGE_IN_WEEKS*DAYS_IN_WEEK);
        // }
        return getUpdatedEdd(r, edd);
    }
    return edd;
};

const isPregnant = records => {
    const report = records.length > 0 ? getNewestReport(records, ['pregnancy']) : null;
    if(report){
        return !getSubsequentDeliveries(records, report).length &&
            !getSubsequentPregnancies(records, report).length &&
            !hasTerminatePregnancyVisits(records, report);
    }
    return false;
};

const getFpExpiryDate = reports => {
  const fpReport = getFPSubscriptionReport(reports);
  if (fpReport){
    if (fpReport.form === 'fp_screening' || fpReport.form === 'fp_follow_up'){
      return getField(fpReport, 'expiry_date');
    }
    if (fpReport.form === 'referral_follow_up'){
      return getField(fpReport, 'family_planning.expiry_date');
    }
  }
  return undefined;
};

const contains = (str, substrings) => {
    return str.split(' ').some(v => substrings.includes(v));
};

const getMostRecentEnrollment = (contact, reports, programs) => {
    // returns the most recent enrollment report and a corresponding exit report that was submitted after enrollment
    const program_reports = {
        enrollment: null,
        exit: null
    };
    const exits = [];
    reports.forEach(function(r) {
        if (
          (
            (programs.includes('art') && r.form === 'referral_follow_up' && getField(r, 'hiv.initiated_treatment') === 'yes') ||
            (programs.includes('ncd') && r.form === 'referral_follow_up' && getField(r, 'ncds.ncd_confirmed') === 'yes' || getField(r, 'ncds.other_ncd_confirmed') === 'yes') ||
            (programs.includes('eid') && r.form === 'referral_follow_up' && getField(r, 'eid.enrolled_in_eid') === 'yes') ||
            (programs.includes('malnutrition') && r.form === 'referral_follow_up' && getField(r, 'malnutrition.malnutrition_confirmed') === 'yes') ||
            (programs.includes('tb') && r.form === 'referral_follow_up' && getField(r, 'tb.put_on_treatment') === 'yes') ||
            (r.form === 'treatment_enrolment' && contains(getField(r, 'treatment_program_details.treatment_enrolment'), programs)) ||
            (r.form === 'discharge' && contains(getField(r, 'discharge_details.discharge_diagnoses'), programs)) ||
            (programs.includes('malnutrition') && r.form === 'under_5_screening' && getField(r, 'malnutrition_screening.enrolled') === 'yes') ||
            (programs.includes('tb') && r.form === 'tb_screening' && getField(r, 'enrolled_tb') === 'yes') ||
            (programs.includes('art') && r.form === 'hiv_screening' && getField(r, 'enrolled_art') === 'yes') ||
            (programs.includes('ncd') && r.form === 'over_5_screening' && getField(r, 'ncd_screening.is_enrolled_ncd') === 'yes')
          ) &&
          (
            !program_reports.enrollment ||
            r.reported_date > program_reports.enrollment.reported_date
          )
        ) {
            program_reports.enrollment = r;
        }

        // note any exit reports we may find for active enrollment verification
        let program = '';
        if(programs.includes('malnutrition')){
            program = 'malnutrition';
        }else if(programs.includes('tb')){
            program = 'tb';
        }

        const field = 'exited_' + program;
        if (r.form === 'exit' && getField(r, field)){
            exits.push(r);
        }
    });

    // verify they haven't been exited after enrollment
    if (program_reports.enrollment){
        program_reports.exit = exits.find(function(r){
            return r.reported_date > program_reports.enrollment.reported_date;
      });
    }
    else if(contact.conditions && contains(contact.conditions, programs)){
        program_reports.enrollment = contact;
    }
    else if(contact.ncds && programs.includes('ncd')){
        program_reports.enrollment = contact;
    }
    return program_reports;
};

const getTreatmentDuration = (contact, reports, condition) => {
    const enrollment_report = getMostRecentEnrollment(contact, reports, condition).enrollment;
    if(enrollment_report){
        if(['contact', 'person'].includes(enrollment_report.type)) {
            return condition.includes('tb')?getDaysPast(new Date(), new Date(contact.tb_treatment_start_date)):getDaysPast(new Date(), new Date(contact.art_start_date));
        }
        else if(enrollment_report.type === 'data_record'){
            return getDaysPast(new Date(), new Date(enrollment_report.reported_date));
        }
    }
    return -1;
};
const getNextImmDate = report => getField(report, 'vaccines_given.next_visit');
// TODO: Check mute for certain dates

const getFPSubscriptionReport = reports => {
  const fpReports = reports.filter(r => (
    (r.form === 'fp_screening' && getField(r, 'on_fp') === 'yes') ||
    (r.form === 'fp_follow_up' && getField(r, 'changed_fp_method') === 'yes') ||
    (r.form === 'referral_follow_up' && getField(r, 'gave_fp_method') === 'yes')
  ));
  if(fpReports.length > 0){
    return getNewestReport(fpReports, fpForms);
  }
  return undefined;
};

const getFPMethodSubscription = reports => {
  const fpReport = getFPSubscriptionReport(reports);
  if(fpReport){
      if (fpReport.form === 'fp_screening'){
          return getField(fpReport, 'fp_method');
      }
      else if (fpReport.form === 'fp_follow_up'){
          return getField(fpReport, 'new_fp_method');
      }
      else if (fpReport.form === 'referral_follow_up'){
          return getField(fpReport, 'gave_fp_method_type');
      }
  }
  return undefined;
};

const isUsingFPService = reports => getFPMethodSubscription(reports) ? 'yes' : 'no';

const getAppointmentDateFromLastTraceReport = reports => {
    const traceReport = getNewestReport(getSubsequentTraceReports(reports), ['trace']);
    if(traceReport){
        return getField(traceReport, 'trace_details.next_visit') ? new Date(getField(traceReport, 'trace_details.next_visit')) : new Date(traceReport.reported_date);
    }
    return null;
};

const getTraceReasonsFromLastTraceReport = reports => {
    const traceReport = getNewestReport(getSubsequentTraceReports(reports), ['trace']);
    const traceReasons = traceReport ? getField(traceReport, 'trace_details.c_trace_reasons') : null;
    return traceReasons ? traceReasons.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',') : '';
};

const getSubsequentTraceReports = reports => {
    return reports.filter(function(r) {
      return traceForms.indexOf(r.form) >= 0;
    });
};
module.exports = {
    DAYS_IN_YEAR,
    getField,
    MS_IN_DAY,
    now,
    PNC_PERIOD_DAYS,
    MAX_PREGNANCY_AGE_IN_WEEKS,
    isEligibleForTasks,
    isReportValid,
    getNewestReport,
    isDateValid,
    getDaysPast,
    getYearsPast,
    DAYS_IN_WEEK,
    isAlive,
    isMuted,
    antenatalForms,
    deliveryForms,
    pregnancyForms,
    postnatalForms,
    enrolmentForms,
    fpForms,
    getSubsequentDeliveries,
    getSubsequentPregnancies,
    hasTerminatePregnancyVisits,
    getUpdatedEdd,
    getCurrentEdd,
    isPregnant,
    getFpExpiryDate,
    getMostRecentEnrollment,
    getTreatmentDuration,
    getPregnancyVisits,
    getNextImmDate,
    isUsingFPService,
    getAppointmentDateFromLastTraceReport,
    getTraceReasonsFromLastTraceReport,
    getSubsequentTraceReports,
    addDate,
    getFPMethodSubscription,
    homeVisitForms
};
