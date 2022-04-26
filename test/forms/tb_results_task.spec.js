const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'tb_results_task';
const harness = new TestHarness();

describe('TB results task form test', () => {
    before(async () => await harness.start());

    after(async () => await harness.stop());

    it('tb results task form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });
});
