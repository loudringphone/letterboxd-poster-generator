require("dotenv").config

/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
    REACT_APP_RAPID_API: process.env.REACT_APP_RAPID_API,
    REACT_APP_PASSWORD: process.env.REACT_APP_PASSWORD
  }
}

module.exports = nextConfig
