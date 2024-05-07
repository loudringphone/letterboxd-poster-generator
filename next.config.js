require("dotenv").config

/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
    REACT_APP_IMDB8_API: process.env.REACT_APP_IMDB8_API,
    REACT_APP_OMDB_API: process.env.REACT_APP_OMDB_API,
    REACT_APP_PASSCODE:
process.env.REACT_APP_PASSCODE
  }
}

module.exports = nextConfig
