import { createSlice } from 'https://cdn.skypack.dev/@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { searchResults: [], historicalSummary: null, analysisReport: null, notifications: [] },
  reducers: {
    setSearchResults: (s, a) => { s.searchResults = a.payload; },
    setHistoricalSummary: (s, a) => { s.historicalSummary = a.payload; },
    setAnalysisReport: (s, a) => { s.analysisReport = a.payload; },
    addNotification: (s, a) => { s.notifications.push({ ...a.payload, id: crypto.randomUUID() }); },
  },
});

export const uiSlice = slice.actions;
export default slice.reducer;