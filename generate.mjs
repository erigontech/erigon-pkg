#!/usr/bin/env zx

import * as aur from './src/aur.mjs'

if(!argv.v){
  console.log("-v flag required")
  process.exit()
}

function semverRegex() {
  return /(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9})(?:-(?:--+)?(?:0|[1-9]\d*|\d*[a-z]+\d*)){0,100}(?=$| |\+|\.)(?:(?<=-\S+)(?:\.(?:--?|[\da-z-]*[a-z-]\d*|0|[1-9]\d*)){1,100}?)?(?!\.)(?:\+(?:[\da-z]\.?-?){1,100}?(?!\w))?(?!\+)/gi;
}

const fileTooSmall = (filename) => {
  return fs.statSync(filename).size < 1024*1024
}

export const downloadAndHashPackage = async ({version, download_url, filename}) => {
  fs.ensureDirSync("temp")
  await $`curl -L '${download_url}' > ./temp/${filename}`.quiet()
  if(fileTooSmall("temp/"+filename)) {
    throw "error: downloaded empty package"
  }
  const version_hash = (await $`b2sum ./temp/${filename}`).stdout.split("  ")[0]
  return {
    version,
    download_url,
    version_hash,
    filename,
  }
}

export const getLatestVersion = async ()=>{
  const payload = await (await fetch("https://api.github.com/repos/ledgerwatch/erigon/releases")).json()
  const version = payload[0].name.replace("v","")
  return version
}


const main = async ()=>{
  // remove tmp dir
  try  {
    fs.rmSync("temp", {recursive: true})
  }catch{
  }


  let version = argv.v

  if(version === "latest") {
    version = await getLatestVersion("latest")
  }
  console.log(chalk.green(`using latest version: ${version}`))

  if(!semverRegex().test(version)) {
    console.error(`version ${version} failed regex for semver`)
    process.exit(1)
  }

  //const pkg = await downloadAndHashPackage({
  //  filename: `src-v${version}.tar.gz`
  //  download_url: `https://github.com/ledgerwatch/erigon/archive/refs/tags/v${version}.tar.gz`,
  //  version
  //})

{
    const pkg = await downloadAndHashPackage({
      filename: `bin-v${version}.tar.gz`,
      download_url: `https://github.com/ledgerwatch/erigon/releases/download/v${version}/erigon_${version}_linux_amd64.tar.gz`,
      version
    })
    const pkgPath = await aur.formBinPackage(pkg)
    await $`git clone aur@aur.archlinux.org:erigon-bin.git ./temp/erigon-bin`
    await $`find ${pkgPath} -type f | xargs mv -t ./temp/erigon-bin`
    if(argv.publish === true || argv.publish === "true") {
      await $`cd ./temp/erigon-bin && git add -A && git commit -m "update to ${pkg.version}" && git push`
      process.exit(0)
    } else {
      console.log(chalk.green("dry run success. run with flag --publish to publish"))
    }
  }

}



main().catch((e)=>{
  console.error(chalk.red(e))
  process.exit(1)
})
