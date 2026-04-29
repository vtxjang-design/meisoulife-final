export const leaderThresholds = {
  paidDays: 30,
  checkInCount: 10,
  helpfulComments: 3
} as const;

export type LeaderMetrics = {
  paidDays: number;
  checkInCount: number;
  helpfulComments: number;
  candidateLeader?: boolean | null;
};

export function isLeaderCandidate(metrics: LeaderMetrics) {
  return Boolean(
    metrics.candidateLeader ||
      (metrics.paidDays >= leaderThresholds.paidDays &&
        metrics.checkInCount >= leaderThresholds.checkInCount &&
        metrics.helpfulComments >= leaderThresholds.helpfulComments)
  );
}

export function getLeaderProgress(metrics: LeaderMetrics) {
  return {
    paidDays: {
      current: metrics.paidDays,
      target: leaderThresholds.paidDays,
      complete: metrics.paidDays >= leaderThresholds.paidDays
    },
    checkInCount: {
      current: metrics.checkInCount,
      target: leaderThresholds.checkInCount,
      complete: metrics.checkInCount >= leaderThresholds.checkInCount
    },
    helpfulComments: {
      current: metrics.helpfulComments,
      target: leaderThresholds.helpfulComments,
      complete: metrics.helpfulComments >= leaderThresholds.helpfulComments
    }
  };
}
