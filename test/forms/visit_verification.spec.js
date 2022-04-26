const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { visitVerificationScenarios } = require('../form-inputs');
const formName = 'visit_verification';
const harness = new TestHarness();

describe('Visit verification form test', () => {
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

    it('visit verification form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('visit verification form can be filled and successfully saved - art', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.art);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021'
        });
    });

    it('visit verification form can be filled and successfully saved - diabetes', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.diabetes);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });

    it('visit verification form can be filled and successfully saved - chronic lung disease', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.chronic_lung);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });

    it('visit verification form can be filled and successfully saved - epilepsy', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.epilepsy);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });

    it('visit verification form can be filled and successfully saved - mental health disease', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.mental_health);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });

    it('visit verification form can be filled and successfully saved - mental health disease (other medication)', async () => {
        // Load the visit verification form and fill in
        const result = await harness.fillForm(formName, ...visitVerificationScenarios.mental_health_other);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });
});
