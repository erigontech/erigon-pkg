#!/usr/bin/env zx




const env = (str)=> { return "${"+str+"}" }



export const formSourcePackage = async (args) => {
  const rootDir = `temp/aur_${args.filename}/`
  fs.removeSync(rootDir)
  fs.ensureDirSync(rootDir)
  fs.outputFileSync(`${rootDir}/PKGBUILD`, PKGBUILD_Source(args))
  await $`cd ${rootDir} && makepkg --printsrcinfo > .SRCINFO`.quiet()

  return rootDir
}

export const formBinPackage = async (args) => {
  const rootDir = `temp/aur_${args.filename}/`
  fs.removeSync(rootDir)
  fs.ensureDirSync(rootDir)
  fs.outputFileSync(`${rootDir}/PKGBUILD`, PKGBUILD_bin(args))
  await $`cd ${rootDir} && makepkg --printsrcinfo > .SRCINFO`.quiet()
  return rootDir
}

export const PKGBUILD_Source = (args) => {
  const {version, download_url, version_hash} = args
  return `pkgname=erigon
pkgdesc='Ethereum implementation on the efficiency frontier.'
pkgver=${version}
pkgrel=1
epoch=1
url='https://github.com/ledgerwatch/erigon'
arch=('x86_64' 'aarch64')
license=('GPL3')
makedepends=('go')
depends=('glibc')
source=("${download_url}")
b2sums=('${version_hash}')

build() {
    cd ${env("pkgname")}-${env("pkgver")}

    export CGO_LDFLAGS="$LDFLAGS"
    export GIT_TAG="v${env("pkgver")}"
    make all
}

package() {
    cd ${env("pkgname")}-${env("pkgver")}

    install -Dm755 build/bin/erigon "${env("pkgdir")}"/usr/bin/erigon
    install -Dm755 build/bin/rpcdaemon "${env("pkgdir")}"/usr/bin/erigon-rpcdaemon
    install -Dm755 build/bin/sentry "${env("pkgdir")}"/usr/bin/erigon-sentry
    install -Dm755 build/bin/downloader "${env("pkgdir")}"/usr/bin/erigon-downloader
    install -Dm755 build/bin/txpool "${env("pkgdir")}"/usr/bin/erigon-txpool
    install -Dm755 build/bin/integration "${env("pkgdir")}"/usr/bin/erigon-integration
    install -Dm755 build/bin/hack "${env("pkgdir")}"/usr/bin/erigon-hack
}
`
}


export const PKGBUILD_bin = (args) => {
  const {version, download_url, version_hash} = args
  return `pkgname=erigon-bin
pkgdesc='Ethereum implementation on the efficiency frontier. Binary distribution'
pkgver=${version}
pkgrel=1
url='https://github.com/ledgerwatch/erigon'
provides=('erigon')
conflicts=('erigon')
arch=('x86_64')
license=('GPL3')
source=("${download_url}")
b2sums=('${version_hash}')

package() {
    install -Dm755 erigon "${env("pkgdir")}"/usr/bin/erigon
}
`
}
