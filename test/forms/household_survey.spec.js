const chai = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { householdSurveyScenarios } = require('../form-inputs');
const chaiDateTime = require('chai-datetime');
chai.use(chaiDateTime);
const expect = chai.expect;
const formName = 'household_survey';
const harness = new TestHarness({ subject: 'family_id' });
process.env.TZ = 'UTC';

describe('Household survey form test', () => {

    before(async () => {
      return await harness.start();
    });

    after(async () => {
      return await harness.stop();
    });

    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2019
        return await harness.setNow('2019-01-01');
    });

    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('household survey form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('household survey form can be filled and successfully saved - surveyWithNoOther', async () => {
        // Load the household survey form and fill in
        const result = await harness.fillForm(...householdSurveyScenarios.surveyWithNoOther);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            place_id: 'family_id'
        });
    });

    it('household survey form can be filled and successfully saved - surveyWithOther', async () => {
        // Load the household survey form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...householdSurveyScenarios.surveyWithOther);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            place_id: 'family_id'
        });
    });
});
