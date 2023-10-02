#!/usr/bin/env zx

import * as aur from './src/aur.mjs'

if(!argv.v){
  console.log("-v flag required")
  process.exit()
}

function semverRegex() {
	return /(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9})(?:-(?:--+)?(?:0|[1-9]\d*|\d*[a-z]+\d*)){0,100}(?=$| |\+|\.)(?:(?<=-\S+)(?:\.(?:--?|[\da-z-]*[a-z-]\d*|0|[1-9]\d*)){1,100}?)?(?!\.)(?:\+(?:[\da-z]\.?-?){1,100}?(?!\w))?(?!\+)/gi;
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
try  {
  fs.rmSync("temp", {recursive: true})
}catch{
}


const version = argv.v
if(!semverRegex().test(version)) {
  console.error(`version ${version} failed regex for semver`)
  process.exit(1)
}



//{
//  const pkg = await makeAndDownloadSourcePackage(argv.v)
//  const pkgPath = aur.formSourcePackage(pkg)
//}

{
  const pkg = await makeAndDownloadBinPackage(version)
  const pkgPath = aur.formBinPackage(pkg)
  const command = `cd temp &&
git clone aur@aur.archlinux.org:erigon-bin.git &&
cd erigon-bin &&
mv ../../${pkgPath}PKGBUILD ../../${pkgPath}.SRCINFO . &&
git add -A &&
git commit -m "update to ${pkg.version}" &&
git push
`

  if(argv.publish) {
    $`${command}`
  } else {
    console.log("dry run, use flag --publish to publish")
    console.log(`
${command}
`)
  }
}






