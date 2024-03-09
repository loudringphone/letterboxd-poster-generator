require("dotenv").config

/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
    REACT_APP_IMDB8_API: process.env.REACT_APP_IMDB8_API,
    REACT_APP_OMDB_API: process.env.REACT_APP_OMDB_API
  }
}

module.exports = nextConfig
