#!/usr/bin/env zx

import * as aur from './src/aur.mjs'

if(!argv.v){
  console.log("-v flag required")
  process.exit()
}


export const makeAndDownloadSourcePackage = async (version) => {
  const download_url =  `https://github.com/ledgerwatch/erigon/archive/refs/tags/v${version}.tar.gz`
  fs.ensureDirSync("temp")
  await $`curl -L '${download_url}' > ./temp/src-v${version}.tar.gz`.quiet()
  const version_hash = (await $`b2sum ./temp/src-v${version}.tar.gz`).stdout.split("  ")[0]
  return {
    version,
    download_url,
    version_hash,
  }
}

export const makeAndDownloadBinPackage = async (version) => {
  const download_url = `https://github.com/ledgerwatch/erigon/releases/download/v${version}/erigon_${version}_linux_amd64.tar.gz`
  fs.ensureDirSync("temp")
  await $`curl -L '${download_url}' > ./temp/bin-v${version}.tar.gz`.quiet()
  const version_hash = (await $`b2sum ./temp/bin-v${version}.tar.gz`).stdout.split("  ")[0]
  return {
    version,
    download_url,
    version_hash,
  }
}


// remove tmp dir
fs.rmSync("temp", {recursive: true})

//{
//  const pkg = await makeAndDownloadSourcePackage(argv.v)
//  const pkgPath = aur.formSourcePackage(pkg)
//}

{
  const pkg = await makeAndDownloadBinPackage(argv.v)
  const pkgPath = aur.formBinPackage(pkg)
  $`cd temp &&
    git clone aur@aur.archlinux.org:erigon-bin.git &&
    cd erigon-bin &&
    mv ../../${pkgPath}PKGBUILD ../../${pkgPath}.SRCINFO . &&
    git add -A &&
    git commit -m "update to ${pkg.version}" &&
    git push
  `
}






