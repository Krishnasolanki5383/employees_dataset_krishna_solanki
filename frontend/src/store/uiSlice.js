import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    isLoading: false
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
    },
    setLoading: (state, action) => {
      state.isLoading = !!action.payload;
    }
  }
});

export const { toggleTheme, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
