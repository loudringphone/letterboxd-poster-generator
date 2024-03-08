require("dotenv").config

/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
    REACT_APP_RAPID_API: process.env.REACT_APP_RAPID_API,
    REACT_APP_OMDB_API: process.env.REACT_APP_OMDB_API
  }
}

module.exports = nextConfig
