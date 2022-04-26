const { expect } = require('chai');
const { DateTime, Duration } = require('luxon');
const NOW = DateTime.local();

const { fn: purge } = require('../purge');

describe('purge', () => {

  it('reports', async () => {

    const reports = [
      {
        _id: 'p1',
        form: 'pregnancy',
        reported_date: NOW.minus(Duration.fromObject({ months: 14})).toMillis()
      },
      {
        _id: 'p2',
        form: 'pregnancy',
        reported_date: NOW.minus(Duration.fromObject({ months: 6})).toMillis()
      },
      {
        _id: 'p3',
        form: 'pregnancy',
        reported_date: NOW.minus(Duration.fromObject({ months: 8})).toMillis()
      },
      {
        _id: 'p4',
        form: 'pregnancy',
        reported_date: NOW.minus(Duration.fromObject({ months: 18})).toMillis()
      },
      {
        _id: 'f1',
        form: 'some_form',
        reported_date: NOW.minus(Duration.fromObject({ months: 8})).toMillis()
      },
      {
        _id: 'f2',
        form: 'other_form',
        reported_date: NOW.minus(Duration.fromObject({ months: 3})).toMillis()
      }
    ];
    expect(purge({roles: []}, {}, reports, [])).to.deep.equal(['p1', 'p4', 'f1']);

  });

  it('messages', async () => {

    const messages = [
      {
        _id: 'm1',
        reported_date: NOW.minus(Duration.fromObject({ months: 8})).toMillis()
      },
      {
        _id: 'm2',
        reported_date: NOW.minus(Duration.fromObject({ months: 3})).toMillis()
      },
      {
        _id: 'm3',
        reported_date: NOW.minus(Duration.fromObject({ months: 12})).toMillis()
      }
    ];
    expect(purge({roles: []}, {}, [], messages)).to.deep.equal(['m1', 'm3']);

  });

});
