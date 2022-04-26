const {
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
	getFPMethodSubscription,
	FAMILY_PLANNING_METHODS,
	isPncPeriod,
	getFpExpiryDate,
	getFormattedDate,
	getNewestReport,
	getVaccinesReceived,
	getNextImmDate,
	getMostRecentEnrollment,
	VACCINES,
	getTreatmentProgramId,
	getAppointmentDateFromLastTraceReport,
	getTraceReasonsFromLastTraceReport,
	getNcds,
	getTreatmentDuration,
	isContactTraceReferred,
	getSubsequentTraceReports,
	isAlive,
	deliveryForms,
	isFullyImmunized,
	getTBTestResult
} = require('./contact-summary-extras');

const context = {
	last_tb_results: lastTbResults(reports)
};
let fields = [];
let cards = [];

fields = [
	{ appliesToType: 'person', appliesIf: () => { return !!contact && !!contact.patient_id; }, label: 'patient_id', value: contact.patient_id, width: 4 },
	{ appliesToType: 'person', label: 'contact.age', value: contact.date_of_birth, width: 4, filter: 'age' },
	{ appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + contact.sex, translate: true, width: 4 },
	{ appliesToType: 'person', label: 'contact.parent', value: lineage, filter: 'lineage' },
	{ appliesToType: ['household', 'chw_area', 'schw_region', 'site'], label: 'place.field.contact', value: contact.contact && contact.contact.name, width: 4 },
	{ appliesToType: ['household', 'chw_area', 'schw_region', 'site'], label: 'contact.phone', value: contact.contact && contact.contact.phone, width: 4 },
	{ appliesToType: ['chw', 'schw', 'site_supervisor'], label: 'contact.phone', value: contact && contact.phone, width: 6 },
	{ appliesToType: ['chw', 'schw', 'site_supervisor'], label: 'contact.role', value: contact && contact.contact_type, translate: true, width: 6 },
	{ appliesToType: ['household', 'chw', 'chw_area', 'schw', 'schw_region', 'site', 'site_supervisor'], appliesIf: () => { return contact.parent && lineage[0]; }, label: 'contact.parent', value: lineage, filter: 'lineage' },
];
cards = [
	{
		label: 'contact.profile.pregnancy',
		appliesToType: 'person',
		appliesIf: () => isPregnant(reports),
		fields: () => {
			const fields = [];
			const ancVisits = getANCVisitsCount(reports);
			if (ancVisits > 0) {
				fields.push({
					label: 'contact.profile.edd',
					value: getFormattedDate(getCurrentEdd(reports)) === '' || getFormattedDate(getCurrentEdd(reports)) === 'unknown' ? 'Facility EDD missing' : getFormattedDate(getCurrentEdd(reports)),
					width: 12
				});
			}
			fields.push(
				{
					label: 'contact.profile.visit',
					value: 'contact.profile.visits.of',
					translate: true,
					context: {
						count: ancVisits,
						total: 4,
					}
				}
			);
			return fields;
		},
		modifyContext: function (ctx) {
			ctx.pregnant = isPregnant(reports) ? 'yes' : 'no'; // don't show Create Pregnancy Report button
			ctx.edd = getCurrentEdd(reports);
			ctx.anc_visits = getANCVisitsCount(reports);
			ctx.lmp = getLmpFromPregnancy(reports);
			ctx.pregnancy_uuid = getNewestPregnancyId(reports);
		}
	},
	{
		label: 'contact.profile.pnc',
		appliesToType: 'person',
		appliesIf: function () {
			return isPncPeriod(reports);
		},
		fields: [
			{
				label: 'contact.profile.delivery_place',
				value: function () {
					if (getField(getNewestReport(reports, deliveryForms), 'delivery_details.delivery_place') === null) {
						return 'unknown';
					}
					return getField(getNewestReport(reports, deliveryForms), 'delivery_details.delivery_place');
				},
				width: 4
			},
			{
				label: 'contact.profile.delivery_date',
				value: function () {
					if (getField(getNewestReport(reports, deliveryForms), 'delivery_date') === null) {
						return 'unknown';
					}
					return getField(getNewestReport(reports, deliveryForms), 'delivery_date');
				},
				filter: 'relativeDay',
				width: 4
			},
			{
				label: 'contact.profile.live_births',
				value: function () {
					if (getField(getNewestReport(reports, deliveryForms), 'delivery_outcome.babies_delivered') === null) {
						return 'unknown';
					}
					return getField(getNewestReport(reports, deliveryForms), 'delivery_outcome.live_births') + ' out of ' + getField(getNewestReport(reports, deliveryForms), 'delivery_outcome.babies_delivered');
				},
				width: 4
			},
		],
		modifyContext: function (ctx) {
			ctx.days_since_delivery = getDaysSinceDelivery(reports);
		},
	},
	{
		label: 'contact.profile.fp',
		appliesToType: 'person',
		appliesIf: () => isAlive(contact) && isOfChildBearingAge(contact) && !isPncPeriod(reports) && !isPregnant(reports),
		fields: [{
			label: 'contact.profile.fp.method',
			value: FAMILY_PLANNING_METHODS[getFPMethodSubscription(reports)] || 'contact.profile.not-on-fp',
			translate: true,
			width: 6
		},
		{
			label: 'contact.profile.fp.method.expiry',
			value: getFormattedDate(getFpExpiryDate(reports)) || 'contact.profile.not-applicable',
			width: 6,
			translate: true
		},
		],
		modifyContext: function (ctx) {
			ctx.is_in_fp = isUsingFPService(reports);
			ctx.fp_method = getFPMethodSubscription(reports);
		},
	},
	{
		label: 'contact.profile.immunizations',
		appliesToType: 'person',
		appliesIf: () => {
			return getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 5;
		},
		fields: () => {
			const fields = [];
			const vaccinations = getVaccinesReceived(reports);
			const newestImmVisit = getNewestReport(reports, ['immunization']);
			const newestScreening = getNewestReport(reports, ['under_5_screening']);
			if (vaccinations.length > 0) {
				let nextImmunizationDate = '';
				if (newestImmVisit.created_by_doc === newestScreening._id) {
					nextImmunizationDate = getNextImmDate(newestScreening);
				}
				fields.push({
					label: 'contact.profile.immunization.confirmed',
					value: Array.from(new Set(vaccinations)).join(),
					width: 12
				});

				if (!isFullyImmunized(reports)) {
					fields.push({
						label: 'contact.profile.immunization.next_visit',
						value: nextImmunizationDate ? getFormattedDate(nextImmunizationDate) : 'contact.profile.not-applicable',
						width: 12
					});
				}

				fields.push({
					label: 'contact.profile.immunization.fully_immunized',
					value: 'contact.profile.immunization.fully_immunized.' + (isFullyImmunized(reports) ? 'yes' : 'no'),
					translate: true
				});
			} else {
				fields.push({
					label: 'contact.profile.immunization.confirmed',
					value: 'contact.profile.immunization.none',
					translate: true
				});
			}
			return fields;
		},
		modifyContext: function (ctx) {
			const vaccinations = getVaccinesReceived(reports);
			const newestImmVisit = getNewestReport(reports, ['immunization']);
			const newestScreening = getNewestReport(reports, ['under_5_screening']);
			let nextImmunizationDate = '';
			let vaccines = [];
			if (vaccinations.length > 0) {
				if (newestImmVisit.created_by_doc === newestScreening._id) {
					nextImmunizationDate = getNextImmDate(newestScreening);
				}
				vaccines = Array.from(new Set(vaccinations)).join();
			}
			ctx.last_visit_next_appointment_date = nextImmunizationDate;
			ctx.was_given_bcg = vaccines.includes(VACCINES['bcg']) ? 'yes' : 'no';
			ctx.was_given_birth_polio = vaccines.includes(VACCINES['birth_polio']) ? 'yes' : 'no';
			ctx.was_given_opv = vaccines.includes(VACCINES['opv_1']) && vaccines.includes(VACCINES['opv_2']) && vaccines.includes(VACCINES['opv_3']) ? 'yes' : 'no';
			ctx.was_given_opv_1 = vaccines.includes(VACCINES['opv_1']) ? 'yes' : 'no';
			ctx.was_given_opv_2 = vaccines.includes(VACCINES['opv_2']) ? 'yes' : 'no';
			ctx.was_given_opv_3 = vaccines.includes(VACCINES['opv_3']) ? 'yes' : 'no';
			ctx.was_given_pcv = vaccines.includes(VACCINES['pcv_1']) && vaccines.includes(VACCINES['pcv_2']) && vaccines.includes(VACCINES['pcv_3']) ? 'yes' : 'no';
			ctx.was_given_pcv_1 = vaccines.includes(VACCINES['pcv_1']) ? 'yes' : 'no';
			ctx.was_given_pcv_2 = vaccines.includes(VACCINES['pcv_2']) ? 'yes' : 'no';
			ctx.was_given_pcv_3 = vaccines.includes(VACCINES['pcv_3']) ? 'yes' : 'no';
			ctx.was_given_dpt_hepb_hib = vaccines.includes(VACCINES['dpt_hepb_hib_1']) && vaccines.includes(VACCINES['dpt_hepb_hib_2']) && vaccines.includes(VACCINES['dpt_hepb_hib_3']) ? 'yes' : 'no';
			ctx.was_given_dpt_hepb_hib_1 = vaccines.includes(VACCINES['dpt_hepb_hib_1']) ? 'yes' : 'no';
			ctx.was_given_dpt_hepb_hib_2 = vaccines.includes(VACCINES['dpt_hepb_hib_2']) ? 'yes' : 'no';
			ctx.was_given_dpt_hepb_hib_3 = vaccines.includes(VACCINES['dpt_hepb_hib_3']) ? 'yes' : 'no';
			ctx.was_given_ipv = vaccines.includes(VACCINES['ipv']) ? 'yes' : 'no';
			ctx.was_given_rota = vaccines.includes(VACCINES['rota_1']) && vaccines.includes(VACCINES['rota_2']) ? 'yes' : 'no';
			ctx.was_given_rota_1 = vaccines.includes(VACCINES['rota_1']) ? 'yes' : 'no';
			ctx.was_given_rota_2 = vaccines.includes(VACCINES['rota_2']) ? 'yes' : 'no';
			ctx.was_given_vitamin_a = vaccines.includes(VACCINES['vitamin_a']) ? 'yes' : 'no';
			ctx.was_given_measles = vaccines.includes(VACCINES['measles_1']) && vaccines.includes(VACCINES['measles_2']) ? 'yes' : 'no';
			ctx.was_given_measles_1 = vaccines.includes(VACCINES['measles_1']) ? 'yes' : 'no';
			ctx.was_given_measles_2 = vaccines.includes(VACCINES['measles_2']) ? 'yes' : 'no';
			ctx.is_fully_immunized = isFullyImmunized(reports);
		}
	},
	{
		label: 'contact.profile.treatment_program',
		appliesToType: 'person',
		appliesIf: function () {
			const treatment_reports = getMostRecentEnrollment(contact, reports, ['art', 'tb', 'ncd', 'malnutrition', 'eid']);
			return treatment_reports.enrollment && !treatment_reports.exit;
		},
		fields: function () {
			const fields = [];
			const artProgramId = getTreatmentProgramId(contact, reports, ['art']);
			fields.push({
				label: 'contact.profile.art',
				value: getMostRecentEnrollment(contact, reports, ['art']).enrollment ? (artProgramId ? artProgramId.toUpperCase() : 'contact.profile.no-id') : 'contact.profile.not-enrolled',
				width: 6,
				translate: true
			});
			if (getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 5) {
				fields.push({
					label: 'contact.profile.eid',
					value: getMostRecentEnrollment(contact, reports, ['eid']).enrollment ? getTreatmentProgramId(contact, reports, ['eid']).toUpperCase() : 'contact.profile.not-enrolled',
					width: 6,
					translate: true
				});
			}
			fields.push({
				label: 'contact.profile.tb_program',
				value: getMostRecentEnrollment(contact, reports, ['tb']).enrollment ? 'contact.profile.enrolled' : 'contact.profile.not-enrolled',
				width: 12,
				translate: true
			});
			if (getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 5) {
				fields.push({
					label: 'contact.profile.malnutrition_program',
					value: getMostRecentEnrollment(contact, reports, ['malnutrition']).enrollment ? 'contact.profile.enrolled' : 'contact.profile.not-enrolled',
					width: 12,
					translate: true
				});
			}
			fields.push({
				label: 'contact.profile.ncd_label',
				value: getMostRecentEnrollment(contact, reports, ['ncd']).enrollment ? Array.from(new Set(getNcds(contact, reports, ['ncd']))).join() : 'contact.profile.not-enrolled',
				width: 12,
				translate: true
			});
			if (getMostRecentEnrollment(contact, reports, ['ncd']).enrollment) {
				fields.push({
					label: 'contact.profile.ncd_id',
					value: getTreatmentProgramId(contact, reports, ['ncd']) ? getTreatmentProgramId(contact, reports, ['ncd']).toUpperCase() : 'contact.profile.no-id',
					width: 6,
					translate: true
				});
			}
			fields.push({
				label: 'contact.profile.mental_health_id',
				value: getMostRecentEnrollment(contact, reports, ['mental_health']).enrollment ? getTreatmentProgramId(contact, reports, ['mental_health']).toUpperCase() : 'contact.profile.not-enrolled',
				width: 6,
				translate: true
			});
			return fields;
		},
		modifyContext: function (ctx) {
			ctx.is_in_art = getMostRecentEnrollment(contact, reports, ['art']).enrollment ? 'yes' : 'no';
			ctx.is_in_tb = getMostRecentEnrollment(contact, reports, ['tb']).enrollment ? 'yes' : 'no';
			ctx.is_in_ncd = getMostRecentEnrollment(contact, reports, ['ncd']).enrollment ? 'yes' : 'no';
			ctx.is_in_eid = getMostRecentEnrollment(contact, reports, ['eid']).enrollment ? 'yes' : 'no';
			ctx.is_in_malnutrition = getMostRecentEnrollment(contact, reports, ['malnutrition']).enrollment ? 'yes' : 'no';
			ctx.ncds = getNcds(contact, reports, ['ncd']);
			ctx.other_ncds = Array.from(new Set(getNcds(contact, reports, ['ncd']))).join().split(' - ')[1];
			ctx.art_duration = getTreatmentDuration(contact, reports, ['art']);
			ctx.tb_treatment_duration = getTreatmentDuration(contact, reports, ['tb']);
			ctx.appt_date = getAppointmentDateFromLastTraceReport(reports);
			ctx.trace_reasons = getTraceReasonsFromLastTraceReport(reports);
			ctx.has_trace_report = getSubsequentTraceReports(reports).length ? 'yes' : 'no';
			ctx.art_duration_years = parseInt(getTreatmentDuration(contact, reports, ['art']) / DAYS_IN_YEAR);
			ctx.is_contact_tracing_referred = isContactTraceReferred(reports) ? 'yes' : 'no';
			ctx.ncd_id = getTreatmentProgramId(contact, reports, ['ncd']);
			ctx.tb_test_result = getTBTestResult(reports);
		},
	}
];

// Added to ensure CHW info is pulled into forms accessed via tasks
if (lineage[0] && lineage[0].contact) {
	if (lineage[1] && lineage[1].contact) {
		context.chw_name = lineage[1].contact.name;
		context.chw_phone = lineage[1].contact.phone;
		if (lineage[2] && lineage[2].contact) {
			context.schw_phone = lineage[2].contact.phone;
		}
	}
}

if (contact.contact_type === 'household') {
	context.schw_id = lineage[0].schw_id;
	if (lineage[0].ss_id) {
		context.ss_id = lineage[0].ss_id;
	}
}

module.exports = {
	context,
	cards,
	fields,
};
