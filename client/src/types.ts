export type League = {
  id: string;
  name: string;
  leagueType: 'standard' | 'challenge';
  commissionerId: string;
  seasonStatus: 'pre_draft' | 'drafting' | 'in_progress' | 'playoffs' | 'complete';
  currentWeek: number;
  maxTeams: number;
  myTeam?: {
    teamName: string;
    rank: number;
    totalPoints: number;
  };
  teamCount: number;
  status: 'active' | 'draft';
};
