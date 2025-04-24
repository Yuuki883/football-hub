// リーグ関連の型定義
export interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  slug?: string;
}

export interface Country {
  name: string;
  code?: string;
  flag: string;
}

export interface LeagueData {
  league: League;
  country: Country;
  seasons?: Season[];
}

export interface Season {
  year: number;
  start: string;
  end: string;
  current: boolean;
}

// 順位表関連の型定義
export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

// チーム関連の型定義
export interface Team {
  id: number;
  name: string;
  logo: string;
}

// 試合関連の型定義
export interface Match {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team & { winner: boolean | null };
    away: Team & { winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

// 選手関連の型定義
export interface Player {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: PlayerStatistics[];
}

export interface PlayerStatistics {
  team: Team;
  league: League;
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    position: string;
    rating?: string;
    captain: boolean;
  };
  goals: {
    total: number;
    conceded: number;
    assists: number;
    saves: number;
  };
  shots: {
    total: number;
    on: number;
  };
  passes: {
    total: number;
    key: number;
    accuracy: number;
  };
  tackles: {
    total: number;
    blocks: number;
    interceptions: number;
  };
  duels: {
    total: number;
    won: number;
  };
  dribbles: {
    attempts: number;
    success: number;
    past: number;
  };
  fouls: {
    drawn: number;
    committed: number;
  };
  cards: {
    yellow: number;
    yellowred: number;
    red: number;
  };
  penalty: {
    won: number;
    committed: number;
    scored: number;
    missed: number;
    saved: number;
  };
}
