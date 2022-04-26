const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'delivery';
const { delivery, over_5_screening, delivery_check, monthly_follow_up } = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('PNC Follow Up Task', function () {
    this.timeout(10000);
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => {
        await harness.clear();
        return await harness.setNow(now.toISODate());
    });
    afterEach(() => expect(harness.consoleErrors).to.be.empty);

    const validateTaskSchedule = async (deliveryDate) => {
        harness.setNow(deliveryDate.plus({ day: 3 }).toISODate());
        expect(await harness.getTasks({ title: 'task.title.postnatal_follow_up' })).lengthOf(1);

        harness.setNow(deliveryDate.plus({ day: 5 }).toISODate());
        let tasks = await harness.getTasks({ title: 'task.title.postnatal_follow_up' });
        expect(tasks.filter(t => t._id.includes('postnatal-follow-up-2'))).lengthOf(1);

        harness.setNow(deliveryDate.plus({ day: 7 }).toISODate());
        tasks = await harness.getTasks({ title: 'task.title.postnatal_follow_up' });
        expect(tasks.filter(t => t._id.includes('postnatal-follow-up-3'))).lengthOf(1);

        harness.setNow(deliveryDate.plus({ day: 42 }).toISODate());
        tasks = await harness.getTasks({ title: 'task.title.postnatal_follow_up' });
        expect(tasks.filter(t => t._id.includes('postnatal-follow-up-4'))).lengthOf(1);
    };

    it('day 3, 5, 7 & 42 PNC task appears on schedule triggered by delivery form', async () => {
        const deliveryDate = now.minus({ day: 1 });

        const result = await harness.fillForm(formName, ...delivery.onechild(deliveryDate.toISODate()));
        expect(result.errors).to.be.empty;

        await validateTaskSchedule(deliveryDate);
    });

    it('day 3, 5, 7 & 42 PNC task appears on schedule triggered by delivery via delivery check', async () => {
        const lastLMPDate = now;
        harness.subject.date_of_birth = '2000-01-01';
        let result = await harness.fillForm('over_5_screening', ...over_5_screening.over_5_screening_pregnant(lastLMPDate.toISODate()));
        expect(result.errors).to.be.empty;

        await harness.flush({ months: 9 });
        const deliveryCheck = (await harness.getTasks({ actionForm: 'delivery_check' }))[0];

        const deliveryDate = lastLMPDate.plus({ month: 9 });
        result = await harness.loadAction(deliveryCheck, ...delivery_check.delivered(deliveryDate.toISODate()));
        expect(result.errors).to.be.empty;

        await validateTaskSchedule(deliveryDate);
    });

    it('day 3, 5, 7 & 42 PNC task appears on schedule triggered by delivery via monthly follow up', async () => {
        const lastLMPDate = now.startOf('month');
        harness.setNow(lastLMPDate.toISODate());
        harness.subject.date_of_birth = '2000-01-01';
        let result = await harness.fillForm('over_5_screening', ...over_5_screening.over_5_screening_pregnant(lastLMPDate.toISODate()));
        expect(result.errors).to.be.empty;

        const deliveryDate = lastLMPDate.plus({ month: 6 });
        await harness.flush(deliveryDate.diff(lastLMPDate, 'days').toObject().days);
        const followUp = (await harness.getTasks({ actionForm: 'monthly_follow_up' }))[0];
        result = await harness.loadAction(followUp, ...monthly_follow_up.delivered(deliveryDate.toISODate()));
        expect(result.errors).to.be.empty;

        await validateTaskSchedule(deliveryDate);
    });

});
