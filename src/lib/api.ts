
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
const SERIES_ID = '0cdf6736-ad9b-4e95-a647-5ee3a99c5510';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchSeriesInfo(db: Firestore): Promise<SeriesInfoResponse | null> {
  const cacheRef = doc(db, 'cricketSeries', SERIES_ID);

  try {
    // 1. Check Firestore Cache
    const cacheSnap = await getDoc(cacheRef);
    if (cacheSnap.exists()) {
      const cachedData = cacheSnap.data();
      const lastUpdated = (cachedData.lastUpdated as Timestamp).toDate();
      const now = new Date();

      // If cache is fresh (less than 24h old), return it
      if (now.getTime() - lastUpdated.getTime() < CACHE_DURATION_MS) {
        console.log('Serving from Firestore cache');
        return cachedData.rawResponse as SeriesInfoResponse;
      }
    }

    // 2. Fetch from External API
    console.log('Cache stale or missing. Fetching from CricAPI...');
    const response = await fetch(
      `https://api.cricapi.com/v1/series_info?apikey=${CRICAPI_KEY}&id=${SERIES_ID}`
    );
    if (!response.ok) throw new Error('Failed to fetch series data from API');
    
    const apiData: SeriesInfoResponse = await response.json();
    
    if (apiData.status !== 'success') {
      // Fallback to cache even if stale if API fails (e.g. rate limit)
      if (cacheSnap.exists()) {
        return cacheSnap.data().rawResponse;
      }
      throw new Error('API returned failure status');
    }

    // 3. Update Firestore Cache
    // We don't await this to keep the UI responsive
    setDoc(cacheRef, {
      id: SERIES_ID,
      name: apiData.data.info.name,
      lastUpdated: serverTimestamp(),
      rawResponse: apiData
    }, { merge: true });

    return apiData;

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
