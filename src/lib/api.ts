import { Firestore, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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
const SERIES_ID = '87c62aac-bc3c-4738-ab93-19da0690488f';
const CACHE_DURATION_MS = 60 * 60 * 1000; // Restored to 1 hour

export async function fetchSeriesInfo(db: Firestore): Promise<SeriesInfoResponse | null> {
  const cacheRef = doc(db, 'cricketSeries', SERIES_ID);

  try {
    let resultData: SeriesInfoResponse | null = null;
    
    // 1. Check Firestore Cache
    const cacheSnap = await getDoc(cacheRef);
    if (cacheSnap.exists()) {
      const cachedData = cacheSnap.data();
      const lastUpdated = (cachedData.lastUpdated as Timestamp).toDate();
      const now = new Date();

      if (now.getTime() - lastUpdated.getTime() < CACHE_DURATION_MS) {
        resultData = cachedData.rawResponse as SeriesInfoResponse;
      }
    }

    if (!resultData) {
      // 2. Fetch from External API
      const response = await fetch(
        `https://api.cricapi.com/v1/series_info?apikey=${CRICAPI_KEY}&id=${SERIES_ID}`
      );
      if (!response.ok) throw new Error('Failed to fetch series data from API');
      
      const apiData: SeriesInfoResponse = await response.json();
      
      if (apiData.status !== 'success') {
        if (cacheSnap.exists()) {
          resultData = cacheSnap.data().rawResponse;
        } else {
          throw new Error('API returned failure status');
        }
      } else {
        resultData = apiData;
        // 3. Update Firestore Cache
        setDoc(cacheRef, {
          id: SERIES_ID,
          name: apiData.data.info.name,
          lastUpdated: serverTimestamp(),
          rawResponse: apiData
        }, { merge: true });
      }
    }

    return resultData;

  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function fetchMatchDetails(db: Firestore, matchId: string): Promise<Match | null> {
  const series = await fetchSeriesInfo(db);
  if (!series) return null;
  return series.data.matchList.find(m => m.id === matchId) || null;
}

export function getWinnerFromStatus(status: string, teamNames: string[]): string | null {
  const s = status.toLowerCase();
  
  if (!s.includes('won') || s.includes('abandoned') || s.includes('no result') || s.includes('tied')) {
    return null;
  }
  
  for (const name of teamNames) {
    if (s.includes(name.toLowerCase())) {
      return name;
    }
  }
  
  return null;
}

/**
 * Restored point logic: Standard 2 points for all matches.
 */
export function getMatchPointValue(matchName: string): number {
  return 2;
}
