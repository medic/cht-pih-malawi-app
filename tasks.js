const { DateTime } = require('luxon');

const {
  DAYS_IN_YEAR,
  getField,
  now,
  getDaysPast,
  getYearsPast,
  isAlive,
  isMuted,
  fpForms,
  getFpExpiryDate,
  getTreatmentDuration,
  isFormArraySubmittedInWindow,
  isCompletedReferral,
  getNewestReportTimestamp,
  isUsingFPService,
  getAppointmentDateFromLastTraceReport,
  getTraceReasonsFromLastTraceReport,
  PNC_PERIOD_DAYS,
  getMostRecentEnrollment,
  getSubsequentDeliveries,
  hasTerminatePregnancyVisits,
  DAYS_IN_WEEK,
  getNewestReport,
  isPregnant
} = require('./nools-extras');

module.exports = [
  {
    name: 'newborn-postnatal-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.newborn_postnatal_follow_up',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (c) {
      return getDaysPast(new Date(c.contact.date_of_birth), new Date(now)) < PNC_PERIOD_DAYS &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'newborn_postnatal_follow_up'
      }
    ],
    events: [
      {
        id: 'newborn-postnatal-follow-up-1',
        start: 2,
        end: 1,
        days: 3,
      },
      {
        id: 'newborn-postnatal-follow-up-2',
        start: 0,
        end: 1,
        dueDate: (event, c) => {
          return Utils.addDate(new Date(c.contact.date_of_birth), 5);
        }
      },
      {
        id: 'newborn-postnatal-follow-up-3',
        start: 0,
        end: 7,
        dueDate: (event, c) => {
          return Utils.addDate(new Date(c.contact.date_of_birth), 7);
        }
      },
      {
        id: 'newborn-postnatal-follow-up-4',
        start: 7,
        end: 7,
        dueDate: (event, c) => {
          return Utils.addDate(new Date(c.contact.date_of_birth), 42);
        }
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['newborn_postnatal_follow_up'], dueDate, event);
    }
  },
  {
    name: 'postnatal-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.postnatal_follow_up',
    appliesTo: 'reports',
    appliesToType: ['delivery'],
    appliesIf: function (c, r) {
      return r.fields &&
        getField(r, 'delivery_details.delivery_date') &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'postnatal_follow_up'
      }
    ],
    events: [
      {
        id: 'postnatal-follow-up-1',
        start: 2,
        end: 1,
        days: 3,
      },
      {
        id: 'postnatal-follow-up-2',
        start: 0,
        end: 1,
        dueDate: function (event, contact, r) {
          return Utils.addDate(new Date(getField(r, 'delivery_date')), 5);
        }
      },
      {
        id: 'postnatal-follow-up-3',
        start: 0,
        end: 7,
        dueDate: function (event, contact, r) {
          return Utils.addDate(new Date(getField(r, 'delivery_date')), 7);
        }
      },
      {
        id: 'postnatal-follow-up-4',
        start: 7,
        end: 7,
        dueDate: function (event, contact, r) {
          return Utils.addDate(new Date(getField(r, 'delivery_date')), 42);
        }
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['postnatal_follow_up'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'malnutrition-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.malnutrition_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['under_5_screening'],
    appliesIf: function (c, r) {
      return isAlive(c.contact) &&
        !isMuted(c.contact) &&
        !!getField(r, 'malnutrition_screening.malnutrition_signs') &&
        /wasting|hair_colour_changes|bilateral_pitting_oedema/.test(getField(r, 'malnutrition_screening.malnutrition_signs')) &&
        !getMostRecentEnrollment(c.contact, c.reports, ['malnutrition']).enrollment &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'malnutrition';
        }
      }
    ],
    events: [
      {
        id: 'malnutrition-referral-follow-up',
        days: 3,
        start: 2,
        end: 12
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r &&
        isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'malnutrition');
    }
  },
  {
    name: 'iccm-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.imci_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['under_5_screening'],
    appliesIf: function (c, r) {
      const signs = getField(r, 'imci_screening.imci_signs');
      return signs &&
        signs !== 'none' &&
        signs.split(' ').length >= 1 &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'imci';
        }
      }
    ],
    events: [
      {
        id: 'imci-referral-follow-up',
        days: 3,
        start: 2,
        end: 5
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'imci');
    }
  },
  {
    name: 'pnc-ds-referral-follow-up',
    icon: 'icon-pnc-danger-sign',
    title: 'task.title.pnc_ds_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['postnatal_follow_up'],
    appliesIf: function (c, r) {
      const signs = getField(r, 'danger_sign_screening.danger_signs');
      return signs &&
        signs !== 'none' &&
        signs.split(' ').length >= 1 &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'danger_sign';
        }
      }
    ],
    events: [
      {
        id: 'pnc-ds-referral-follow-up',
        days: 3,
        start: 2,
        end: 5
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'danger_sign');
    }
  },
  {
    name: 'hiv-testing-referral-follow-up',
    icon: 'icon-disease-hiv-aids',
    title: 'task.title.hiv_testing_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['hiv_screening'],
    appliesIf: function (c, r) {
      return (
        parseInt(getField(r, 'last_hiv_test')) === 0 ||
        parseInt(getField(r, 'last_hiv_test')) > 3
      ) &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'hiv';
        }
      }
    ],
    events: [
      {
        id: 'hiv-testing-referral-follow-up',
        days: 14,
        start: 7,
        end: 7
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'hiv');
    }
  },
  {
    name: 'ncd-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.ncd_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['over_5_screening'],
    appliesIf: function (c, r) {
      const signs = getField(r, 'ncd_screening.ncd_symptoms');
      return signs &&
        signs !== 'none' &&
        signs.split(' ').length >= 1 &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'ncds';
        }
      }
    ],
    events: [
      {
        id: 'ncd-referral-follow-up',
        days: 14,
        start: 7,
        end: 7
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'ncds');
    }
  },
  {
    name: 'anc-ds-referral-follow-up',
    icon: 'icon-anc-danger-sign',
    title: 'task.title.anc_ds_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['pregnancy', 'pregnancy_follow_up'],
    appliesIf: function (c, r) {
      if (r.form === 'pregnancy') {
        const signs = getField(r, 'danger_signs');
        return signs &&
          signs !== 'none' &&
          signs.split(' ').length >= 1 &&
          isAlive(c.contact) &&
          !isMuted(c.contact) &&
          user.parent.contact_type === 'chw_area';
      }

      if (r.form === 'pregnancy_follow_up') {
        const signs = getField(r, 'danger_sign_screening.danger_signs');
        return signs &&
          signs !== 'none' &&
          signs.split(' ').length >= 1 &&
          isAlive(c.contact) &&
          !isMuted(c.contact) &&
          user.parent.contact_type === 'chw_area';
      }

      return false;
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'danger_sign';
        }
      }
    ],
    events: [
      {
        id: 'anc-ds-referral-follow-up',
        days: 3,
        start: 2,
        end: 5
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'danger_sign');
    }
  },
  {
    name: 'pregnancy-confirmation-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.pregnancy_confirmation_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['fp_screening'],
    appliesIf: function (c, r) {
      return (
        parseInt(getField(r, 'weeks_since_lmp')) > 4 ||
        getField(r, 'wants_fp') === 'yes'
      ) &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'pregnancy_confirmation';
        }
      }
    ],
    events: [
      {
        id: 'pregnancy-confirmation-referral-follow-up',
        days: 2,
        start: 2,
        end: 11
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return r && isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'pregnancy_confirmation');
    }
  },
  {
    name: 'tb-results-task',
    icon: 'icon-followup-general',
    title: 'task.title.tb_results',
    appliesTo: 'reports',
    appliesToType: ['tb_results'],
    appliesIf: function (c) {
      return isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'tb_results_task',
        modifyContent: function (content, c, r) {
          content.tb_result = getField(r, 'results');
        }
      }
    ],
    events: [
      {
        id: 'tb-results-task',
        days: 5,
        start: 5,
        end: 3
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['tb_results_task'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'trace-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.trace_follow_up',
    appliesTo: 'reports',
    appliesToType: ['trace'],
    appliesIf: function (c) {
      return getAppointmentDateFromLastTraceReport(c.reports) &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.contact_type === 'chw';
    },
    actions: [
      {
        type: 'report',
        form: 'trace_follow_up',
        modifyContent: function (content, c) {
          content.trace_reasons = getTraceReasonsFromLastTraceReport(c.reports);
          content.appt_date = getAppointmentDateFromLastTraceReport(c.reports);
          content.chw_phone = user.phone;
        }
      }
    ],
    events: [
      {
        id: 'trace-follow-up',
        days: 3,
        start: 1,
        end: 8
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      const newestVisitVerification = getNewestReport(c.reports, ['visit_verification']);
      return isFormArraySubmittedInWindow(c.reports, ['trace_follow_up'], dueDate, event, null, r._id) ||
        (newestVisitVerification && newestVisitVerification.reported_date > getNewestReportTimestamp(c, ['trace']));
    }
  },
  {
    name: 'delivery-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.delivery_report',
    appliesTo: 'reports',
    appliesToType: ['discharge'],
    appliesIf: function (c, r) {
      return getField(r, 'discharge_details.discharge_diagnoses') === 'delivery' &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'delivery'
      }
    ],
    events: [
      {
        id: 'delivery-follow-up',
        days: 7,
        start: 7,
        end: 0
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['delivery'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'tb-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.daily_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['discharge'],
    appliesIf: function (c, r) {
      return getField(r, 'discharge_details.discharge_diagnoses') === 'tb' &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'daily_follow_up'
      }
    ],
    events: [
      {
        id: 'tb-follow-up',
        days: 7,
        start: 7,
        end: 0
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['daily_follow_up'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'pregnancy-delivery-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.delivery_check',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: (c, r) => !isMuted(c.contact) &&
      isAlive(c.contact) &&
      getSubsequentDeliveries(c.reports, r).length === 0 &&
      !hasTerminatePregnancyVisits(c.reports, r) &&
      user.parent.contact_type === 'chw_area',
    actions: [
      {
        type: 'report',
        form: 'delivery_check'
      }
    ],
    events: [
      {
        id: 'pregnancy-delivery-follow-up',
        start: 14,
        end: 14,
        dueDate: function (e, c, r) {
          const AVG_PREGNANCY_AGE_IN_WEEKS = 40;
          let dueDate = new Date();
          if ('edd' in r.fields && r.fields.edd) {
            dueDate = new Date(Date.parse(r.fields.edd));
          } else {
            dueDate = Utils.addDate(new Date(getField(r, 'c_lmp_date')), AVG_PREGNANCY_AGE_IN_WEEKS * DAYS_IN_WEEK);
          }
          return dueDate;
        },
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['delivery'], dueDate, event);
    }
  },
  {
    name: 'discharge-instructions',
    icon: 'icon-followup-general',
    title: 'task.title.discharge_instructions',
    appliesTo: 'reports',
    appliesToType: ['discharge'],
    appliesIf: function (c, r) {
      return getField(r, 'discharge_details.discharge_diagnoses').includes('other') &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'discharge_instructions',
        modifyContent: function (content, c, r) {
          content.discharge_instructions = getField(r, 'discharge_details.discharge_diagnoses_other');
          content.phone = user.phone;
        }
      }
    ],
    events: [
      {
        id: 'discharge-instructions',
        days: 7,
        start: 7,
        end: 7
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['discharge_instructions'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'eid-referral-follow-up',
    icon: 'icon-people-child',
    title: 'task.title.eid_screening',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (c) {
      return getYearsPast(new Date(c.contact.date_of_birth), new Date()) &&
        c.contact.c_referred_eid === 'yes' &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'eid';
        }
      }
    ],
    events: [
      {
        id: 'eid-referral-follow-up',
        days: 14,
        start: 7,
        end: 7
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      const dateOfBirth = new Date(c.contact.date_of_birth);
      return isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event) &&
        isCompletedReferral(c.reports, dateOfBirth.getTime(), 'eid');
    }
  },
  {
    name: 'tb-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.tb_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['tb_results_task'],
    appliesIf: function (c, r) {
      return getField(r, 'tb_results.referred') === 'yes' &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'tb';
        }
      }
    ],
    events: [
      {
        id: 'tb-referral-follow-up',
        days: 3,
        start: 1,
        end: 5
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return (
        r && r.reported_date < getNewestReportTimestamp(c, ['tb_results_task']) ||
        isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'tb')
      );
    }
  },
  {
    name: 'daily-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.daily_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['treatment_enrolment', 'referral_follow_up'],
    appliesIf: function (c, r) {
      const program = getField(r, 'treatment_program_details.treatment_enrolment');
      return program &&
        (
          program.indexOf('art') !== -1 ||
          (
            program.indexOf('tb') !== -1 &&
            getMostRecentEnrollment(c.contact, c.reports, ['tb']).enrollment
          )
        ) &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'daily_follow_up'
      }
    ],
    events: [
      {
        id: 'daily-referral-follow-up',
        days: 7,
        start: 7,
        end: 0
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['daily_follow_up'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'contact-tracing-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.tb_contact_tracing_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['tb_contact_tracing'],
    appliesIf: function (c) {
      return getYearsPast(new Date(c.contact.date_of_birth), new Date(now)) &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'contact_tracing';
        }
      }
    ],
    events: [
      {
        id: 'contact-tracing-referral-follow-up',
        days: 0,
        start: 0,
        end: 7
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return (
        r && r.reported_date < getNewestReportTimestamp(c, ['tb_contact_tracing']) ||
        isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'contact_tracing')
      );
    }
  },
  {
    name: 'infant-pnc-ds-referral-follow-up',
    icon: 'icon-pnc-danger-sign',
    title: 'task.title.infant_pnc_ds_referral_follow_up',
    appliesTo: 'reports',
    appliesToType: ['newborn_postnatal_follow_up'],
    appliesIf: function (c, r) {
      const danger_signs = getField(r, 'fields.danger_signs');
      return danger_signs &&
        danger_signs !== 'none' &&
        danger_signs.split(' ').length > 0 &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'danger_sign';
        }
      }
    ],
    events: [
      {
        id: 'infant-pnc-ds-referral-follow-up',
        days: 3,
        start: 2,
        end: 5
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return (
        r && r.reported_date < getNewestReportTimestamp(c, ['newborn_postnatal_follow_up']) ||
        isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
        isCompletedReferral(c.reports, r.reported_date, 'danger_sign')
      );
    }
  },
  {
    name: 'fp-expiry-referral-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.fp_expiry',
    appliesTo: 'reports',
    appliesToType: ['fp_screening', 'fp_follow_up', 'referral_follow_up'],
    appliesIf: function (c, r) {
      return r.fields &&
        isAlive(c.contact) &&
        !isMuted(c.contact) &&
        isUsingFPService(c.reports) &&
        Utils.addDate(new Date(getFpExpiryDate(c.reports)), 30) > new Date() &&
        user.parent.contact_type === 'chw_area';
    },
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        modifyContent: function (content) {
          content.ref_type = 'family_planning';
        }
      }
    ],
    events: [
      {
        id: 'fp-expiry-referral-follow-up',
        dueDate: (e, c) => new Date(getFpExpiryDate(c.reports)),
        start: 30,
        end: 30
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return (
        r && r.reported_date < getNewestReportTimestamp(c, fpForms) ||
        (
          isFormArraySubmittedInWindow(c.reports, ['referral_follow_up'], dueDate, event, null, r._id) &&
          getFpExpiryDate(c.reports) > Utils.addDate(new Date(), 30) &&
          isCompletedReferral(c.reports, r.reported_date, 'family_planning')
        )
      );
    }
  },
  /*
  # This should only be available to senior chws, currently availed as an action form
  */
  {
    name: 'sputum-collection',
    icon: 'icon-followup-general',
    title: 'task.title.sputum-collection',
    appliesTo: 'reports',
    appliesToType: ['tb_screening'],
    appliesIf: (c, r) => user.parent.contact_type === 'schw_region' &&
      getField(r, 'c_refer_for_sputum') === 'yes',
    actions: [
      {
        type: 'report',
        form: 'sputum_collection',
        modifyContent: function (content, c, r) {
          content.client_name = getField(r, 'patient_name');
          content.client_id = getField(r, 'patient_id');
          content.client_uuid = getField(r, 'patient_uuid');
          content.client_age_in_years = getField(r, 'patient_age_in_years');
          content.schw_phone = user.phone;
        }
      }
    ],
    contactLabel: (contact, report) => {
      return getField(report, 'patient_name');
    },
    events: [
      {
        id: 'sputum-collection',
        days: 5,
        start: 5,
        end: 3
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['sputum_collection'], dueDate, event, null, r._id);
    }
  },
  {
    name: 'monthly-follow-up',
    icon: 'icon-followup-general',
    title: 'task.title.monthly_follow_up',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (c) {
      const isEligible = isAlive(c.contact) && !isMuted(c.contact) && user.parent.contact_type === 'chw_area';
      if (!isEligible) {
        return false;
      }

      const malnutritionEnrollment = getMostRecentEnrollment(c.contact, c.reports, ['malnutrition']);

      const ncdFollowup = getYearsPast(new Date(c.contact.date_of_birth), new Date(now)) >= 5 &&
        getMostRecentEnrollment(c.contact, c.reports, ['ncd']).enrollment;
      const malnutritionFollowup = getYearsPast(new Date(c.contact.date_of_birth), new Date(now)) < 5 &&
        malnutritionEnrollment.enrollment && !malnutritionEnrollment.exit;
      const artFollowup = getMostRecentEnrollment(c.contact, c.reports, ['art']).enrollment &&
        parseInt(getTreatmentDuration(c.contact, c.reports, ['art'])) > DAYS_IN_YEAR;

      return ncdFollowup || malnutritionFollowup || artFollowup || isPregnant(c.reports);
    },
    actions: [
      {
        type: 'report',
        form: 'monthly_follow_up'
      }
    ],
    events: [-1, 0, 1].map(month => {
      const dueDate = DateTime.local().startOf('month').plus({ month });

      // workaround for https://github.com/medic/cht-core/issues/6608
      return {
        id: `monthly-followup-${dueDate.toFormat('MM-yyyy')}`,
        start: 7,
        end: 7,
        dueDate: () => dueDate.plus({ days: 7 }).toJSDate(),
      };
    }),
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['monthly_follow_up'], dueDate, event);
    }
  },
  /*
  # This should only be available to senior chws
  */
  {
    name: 'tb-results-notification',
    icon: 'icon-followup-general',
    title: 'task.title.tb-results-notification',
    appliesTo: 'reports',
    appliesToType: ['tb_results'],
    appliesIf: function () {
      return user.parent.contact_type === 'schw_region';
    },
    actions: [
      {
        type: 'report',
        form: 'tb_results_notification',
        modifyContent: function (content, c, r) {
          content.client_name = getField(r, 'patient_name');
          content.client_id = getField(r, 'patient_id');
          content.client_uuid = getField(r, 'patient_uuid');
          content.client_age_in_years = getField(r, 'patient_age_in_years');
          content.tb_result = getField(r, 'results');
          content.schw_phone = user.phone;
        }
      }
    ],
    contactLabel: (contact, report) => {
      return getField(report, 'patient_name');
    },
    events: [
      {
        id: 'tb-results-notification',
        days: 5,
        start: 5,
        end: 3
      }
    ],
    resolvedIf: function (c, r, event, dueDate) {
      return isFormArraySubmittedInWindow(c.reports, ['tb_results_notification'], dueDate, event, null, r._id);
    }
  }
];
