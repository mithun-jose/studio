
export interface Team {
  id: string;
  name: string;
  shortname: string;
  img: string;
}

export interface Match {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: Team[];
  score: any[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface SeriesInfoResponse {
  status: string;
  data: {
    info: {
      id: string;
      name: string;
      startdate: string;
      enddate: string;
      matches: number;
    };
    matchList: Match[];
  };
}

const CRICAPI_KEY = '6cbb4198-8e11-46e3-8dd5-f353458e68c1';
const SERIES_ID = '0cdf6736-ad9b-4e95-a647-5ee3a99c5510';

export async function fetchSeriesInfo(): Promise<SeriesInfoResponse | null> {
  try {
    const response = await fetch(
      `https://api.cricapi.com/v1/series_info?apikey=${CRICAPI_KEY}&id=${SERIES_ID}`
    );
    if (!response.ok) throw new Error('Failed to fetch series data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function fetchMatchDetails(matchId: string): Promise<Match | null> {
  // In a real app, we might call another endpoint, but for now we filter the series list
  const series = await fetchSeriesInfo();
  if (!series) return null;
  return series.data.matchList.find(m => m.id === matchId) || null;
}
