#!/usr/bin/env zx

import * as aur from './src/aur.mjs'

if(!argv.v){
  console.log("-v flag required")
  process.exit()
}


export const makeAndDownloadPackage = async (version) => {
  const download_url =  `https://github.com/ledgerwatch/erigon/archive/refs/tags/v${version}.tar.gz`
  fs.ensureDirSync("temp")
  await $`curl -L '${download_url}' > ./temp/v${version}.tar.gz`.quiet()
  const version_hash = (await $`b2sum ./temp/v${version}.tar.gz`).stdout.split("  ")[0]
  return {
    version,
    download_url,
    version_hash,
  }
}


const versionInfo = await makeAndDownloadPackage(argv.v)


aur.formPackage(versionInfo)






