const {
	getField,
	isNewestPregnancy,
	isNewestSpotCheck,
	isNewestU5Screening,
	isDateValid,
	getYearsPast,
	isPatient,
	isMuted,
	reportedThisMonth,
	reportedThisQuarter
} = require('./nools-extras');

const { homeVisitForms } = require('./shared');

module.exports = [
	// General: Total households currently registered by CHWs
	{
		id: 'households-registered-all-time',
		translation_key: 'targets.household.registrations.title',
		subtitle_translation_key: 'targets.all_time.subtitle',
		type: 'count',
		icon: 'medic-clinic',
		goal: -1,
		appliesTo: 'contacts',
		context: 'user.contact_type === "chw"',
		appliesToType: ['household'],
		appliesIf: c => !isMuted(c.contact),
		date: 'now',
		aggregate: true
	},
	// General: Population
	{
		id: 'people-registered-all-time',
		translation_key: 'targets.person.registrations.title',
		subtitle_translation_key: 'targets.all_time.subtitle',
		type: 'count',
		icon: 'icon-people-person-general',
		context: 'user.contact_type === "chw"',
		goal: -1,
		appliesTo: 'contacts',
		appliesToType: ['person'],
		appliesIf: (c) => !isMuted(c.contact) && isPatient(c.contact),
		date: 'now'
	},
	// Indicator: % household visited
	// Definition: All households visited by the CHW / Registered household within the current month
	{
		id: 'percent-households-visited',
		translation_key: 'targets.household.registrations-percent.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		type: 'percent',
		icon: 'icon-community',
		goal: -1,
		appliesTo: 'contacts',
		appliesToType: ['person'],
		context: 'user.contact_type === "chw"',
		appliesIf: c => !isMuted(c.contact) && isPatient(c.contact),
		passesIf: c => {
			return c.reports.some(report => homeVisitForms.includes(report.form) &&
				reportedThisMonth(report));
		},
		idType: (c) => c.contact.parent._id,
		date: 'now',
		aggregate: true
	},
	// General:	spot checks done - this quarter
	{
		id: 'count-chws-supervised-by-schws-this-quarter',
		type: 'count',
		icon: 'icon-people-chw-crop',
		goal: 1,
		translation_key: 'targets.chws.supervised-by-schws-count.title',
		subtitle_translation_key: 'targets.this_quarter.subtitle',
		context: 'user.contact_type === "schw"',
		appliesTo: 'reports',
		appliesToType: ['spot_check'],
		appliesIf: (c, r) => !isMuted(c.contact) &&
				reportedThisQuarter(r),
		date: 'now',
		aggregate: true
	},
	// General:	% of CHWs needing mentorship - this quarter
	{
		id: 'chws-needing-mentorship-this-quarter',
		type: 'count',
		icon: 'icon-household-education',
		goal: -1,
		translation_key: 'targets.chws.needing-mentorship.title',
		subtitle_translation_key: 'targets.this_quarter.subtitle',
		context: 'user.contact_type === "schw"',
		appliesTo: 'reports',
		appliesToType: ['spot_check'],
		appliesIf: (c, r) => !isMuted(c.contact) &&
				reportedThisQuarter(r) &&
				isNewestSpotCheck(c, r) &&
				parseInt(getField(r, 'spot_check_details.family_interview.c_mentorship')) >= 5,
		date: 'now',
		aggregate: true
	},
	// Maternal and Child Health:	Children < 5 currently registered by CHWs as alive and in Neno - all time
	{
		id: 'children-under-5',
		type: 'count',
		icon: 'icon-people-children',
		goal: -1,
		translation_key: 'targets.children_u5.title',
		subtitle_translation_key: 'targets.all_time.subtitle',
		context: 'user.contact_type === "chw"',
		appliesTo: 'contacts',
		appliesToType: ['person'],
		appliesIf: function (c) {
			return c.contact.date_of_birth &&
				isDateValid(new Date(c.contact.date_of_birth)) &&
				getYearsPast(new Date(), new Date(c.contact.date_of_birth)) < 5;
		},
		date: 'now'
	},
	// Maternal and Child Health:	Referred for family planning - current month
	{
		id: 'wra-referred-for-fp',
		type: 'count',
		icon: 'icon-family-planning',
		goal: 5,
		translation_key: 'targets.fp.referral.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		appliesTo: 'reports',
		appliesToType: ['fp_screening', 'fp_follow_up'],
		context: 'user.contact_type === "chw"',
		appliesIf: function (c, r) {
			if (!c.contact) { return false; }
			return getField(r, 'refer_to_hf') === 'yes';
		},
		date: 'reported'
	},
	// Maternal and Child Health: % Pregnancies registered in 1st Trimester with a goal of 80% - this month
	{
		id: 'percent-pregnancies-registered-in-first-trimester',
		type: 'percent',
		icon: 'icon-people-woman-pregnant',
		goal: 80,
		translation_key: 'targets.anc.pregnancies_in_first_trimester-percent.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "chw"',
		appliesTo: 'reports',
		appliesToType: ['pregnancy'],
		appliesIf: function(c, r){
			return isNewestPregnancy(c, r);
		},
		passesIf: function (c, r) {
			return getField(r, 'days_since_lmp') &&
				parseInt(getField(r, 'days_since_lmp')) <= 84;
		},
		date: 'now'
	},
	// TB:	presumptive TB clients accompanied to the SCHW for sputum submission - current month
	{
		id: 'presumptive-tb-for-sputum-collection',
		type: 'count',
		icon: 'icon-disease-pneumonia',
		goal: -1,
		translation_key: 'targets.tb.sputum_collection.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "schw"',
		appliesTo: 'reports',
		appliesToType: ['tb_screening'],
		appliesIf: function (c, r) {
			return getField(r, 'tb_symptoms') !== 'none';
		},
		date: 'reported',
		aggregate: true
	},
	// TB:	presumptive TB clients who submitted sputum to SCHWs this month - current month
	{
		id: 'presumptive-tb-for-sputum-submission',
		type: 'count',
		icon: 'icon-condition-cough',
		goal: 8,
		translation_key: 'targets.tb.sputum_submission.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "schw"',
		appliesTo: 'reports',
		appliesToType: ['sputum_collection'],
		idType: 'contact',
		date: 'reported'
	},
	// TB:	samples tested this month
	{
		id: 'tb-samples-tested',
		type: 'count',
		icon: 'icon-disease-respiratory',
		goal: -1,
		translation_key: 'targets.tb.samples_tested.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.parent && user.parent.parent',
		appliesTo: 'reports',
		appliesToType: ['tb_results'],
		date: 'reported'
	},
	// Malnutrition: % Children <5 screened for Malnutrition with a goal of 100% - this month
	{
		id: 'percent-u5-screened-for-malnutrition',
		type: 'percent',
		icon: 'icon-child-growth',
		goal: 100,
		translation_key: 'targets.malnutrition.screened.u5-percent.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "chw"',
		appliesTo: 'reports',
		appliesToType: ['under_5_screening'],
		appliesIf: function(c, r){
			return isNewestU5Screening(c, r);
		},
		passesIf: function (c, r) {
			return getField(r, 'malnutrition_screening.muac');
		},
		date: 'now'
	},
	// Malnutrition: Children <5 Referred for suspected malnutrition - this month
	{
		id: 'u5-referred-for-malnutrition',
		type: 'count',
		icon: 'icon-child-growth',
		goal: -1,
		translation_key: 'targets.malnutrition.referred.u5.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "chw"',
		appliesTo: 'reports',
		appliesToType: ['under_5_screening'],
		appliesIf: function(c, r){
			return isNewestU5Screening(c, r) && getField(r, 'malnutrition_screening.c_refer_for_maln') === 'yes';
		},
		idType: 'contact',
		date: 'reported'
	},
	// Deaths verified - this month
	{
		id: 'deaths-verified',
		type: 'percent',
		icon: 'icon-death-general',
		goal: -1,
		translation_key: 'targets.deaths-reviewed-percent.title',
		subtitle_translation_key: 'targets.this_month.subtitle',
		context: 'user.contact_type === "schw"',
		appliesTo: 'reports',
		appliesToType: ['death'],
		appliesIf: (c, r) => r.form === 'death',
		passesIf: (c) => c.reports.some(r => r.form === 'death_review'),
		date: 'reported',
		aggregate: true
	}
];
