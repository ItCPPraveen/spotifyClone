module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
