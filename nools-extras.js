const {
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
  getTraceReasonsFromLastTraceReport
} = require('./shared');

const { DateTime } = require('luxon');

const currentDateTime = DateTime.fromJSDate(now);

const reportedThisQuarter = report => {
	const reportedDateTime = DateTime.fromMillis(report.reported_date);
	return currentDateTime.quarter === reportedDateTime.quarter &&
		currentDateTime.year === reportedDateTime.year;
};

const reportedThisMonth = report => {
	const reportedDateTime = DateTime.fromMillis(report.reported_date);
	return currentDateTime.month === reportedDateTime.month &&
		currentDateTime.year === reportedDateTime.year;
};

const isFormArraySubmittedInWindow = (reports, formArray, dueDate, event, count, sourceID) => {
  let found = false;
  let reportCount = 0;

  const start = Utils.addDate(dueDate, -event.start).getTime();
  const end = Utils.addDate(dueDate, event.end + 1).getTime();

  reports.forEach(function (report) {
      if (formArray.includes(report.form)) {
          if (report.reported_date >= start && report.reported_date <= end) {
              if (sourceID) {
                  if (getField(report, 'inputs.source_id') === sourceID) {
                      found = true;

                      if (count) {
                          reportCount++;
                      }
                  }
              } else {
                  found = true;

                  if (count) {
                      reportCount++;
                  }
              }
          }
      }
  });

  if (count) { return reportCount >= count; }
  return found;
};

const isNewestPregnancy = (c, r) => pregnancyForms.indexOf(r.form) >= 0 && r.reported_date === getNewestReport(c.reports, pregnancyForms).reported_date;
const isNewestU5Screening = (c, r) => r.form === 'under_5_screening' && r.reported_date === getNewestReport(c.reports, ['under_5_screening']).reported_date;
const isNewestSpotCheck = (c, r) => r.form === 'spot_check' && r.reported_date === getNewestReport(c.reports, ['spot_check']).reported_date;
const isNewestTbResults = (c, r) => r.form === 'tb_results' && r.reported_date === getNewestReport(c.reports, ['tb_results']).reported_date;

const isCompletedReferral = (reports, base_date, ref_type) => {
    let screenings  = [];
    screenings = reports.filter(function(r){
        return r.reported_date > base_date && r.form === 'referral_follow_up' && r.fields.ref_type === ref_type;
    });
    return screenings.length > 0;
};

const getFamilyIdForContact = c => c.contact.contact_type === 'household'?c.contact._id:c.contact.parent._id;

const isReportHomeVisit = (c, r) => {
  const forms = ['spot_check', 'family_survey', 'over_5_screening', 'under_5_screening', 'monthly_follow_up', 'daily_follow_up', 'death', 'exit', 'discharge', 'treatment_enrolment', 'referral_follow_up', 'tb_home_visit', 'hiv_home_visit', 'discharge_instructions', 'fp_follow_up', 'fp_screening', 'tb_screening', 'pregnancy', 'trace', 'trace_follow_up', 'trace_referral_follow_up', 'mute', 'mute_clinic', 'unmute', 'unmute_clinic'];
  return r && forms.includes(r.form);
};

const getNewestReportTimestamp = (c, report) => {
  const newestReport = getNewestReport(c.reports, report);
  return newestReport ? newestReport.reported_date : 0;
};

const isPatient = contact =>
  contact.parent &&
  contact.parent.parent &&
  contact.parent.parent.parent &&
  contact.parent.parent.parent.parent;

module.exports = {
    DAYS_IN_YEAR,
    getField,
    MS_IN_DAY,
    now,
    PNC_PERIOD_DAYS,
    MAX_PREGNANCY_AGE_IN_WEEKS,
    isEligibleForTasks,
    isReportValid,
    isPatient,
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
    isNewestPregnancy,
    isNewestSpotCheck,
    isNewestU5Screening,
    isFormArraySubmittedInWindow,
    isCompletedReferral,
    getFamilyIdForContact,
    isReportHomeVisit,
    getNewestReportTimestamp,
    isUsingFPService,
    getAppointmentDateFromLastTraceReport,
    getTraceReasonsFromLastTraceReport,
    isNewestTbResults,
    reportedThisMonth,
    reportedThisQuarter
};
