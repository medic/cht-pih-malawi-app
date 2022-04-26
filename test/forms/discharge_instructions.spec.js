const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { dischargeInstructionsScenarios } = require('../form-inputs');
const formName = 'discharge_instructions';
const harness = new TestHarness();

describe('Discharge instructions form test', () => {
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

    it('discharge instructions form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('discharge instructions form can be filled and successfully saved - conveyed', async () => {
        // Load the discharge instructions up form and fill in
        const result = await harness.fillForm(...dischargeInstructionsScenarios.conveyed);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;
    });

    it('discharge instructions form can be filled and successfully saved - not conveyed', async () => {
        // Load the mute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...dischargeInstructionsScenarios.notConveyed);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;
    });
});
