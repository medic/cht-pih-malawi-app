module.exports = {
  cron: '0 23 * * fri',
  fn: (userCtx, contact, reports, messages) => {
    const NOW = Date.now();
    const monthsAgo = months => NOW - 1000 * 60 * 60 * 24 * 30 * months;

    const SCHW_WORKFLOWS = [
      'sputum_collection',
      'tb_results_notification',
      'tb_results',
      'death_review',
      'spot_check',
      'death_confirmation'
    ];

    const reportsToPurge = reports.filter(r => {
      if (userCtx.roles.includes('supervisor') && !SCHW_WORKFLOWS.includes(r.form)){
        return true;
      }
      const purgeThreshold = ['pregnancy', 'pregnancy_follow_up'].includes(r.form) ? 12 : 6;
      return r.reported_date <= monthsAgo(purgeThreshold);
    }).map(r => r._id);

    const messagesToPurge = messages.filter(
      m => m.reported_date <= monthsAgo(6)
    ).map(m => m._id);

    return [...reportsToPurge, ...messagesToPurge];
  }
};
