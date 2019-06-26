module.exports = {
  devServer: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
