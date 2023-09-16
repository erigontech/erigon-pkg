#!/usr/bin/env zx




const env = (str)=> { return "${"+str+"}" }



export const formPackage = (args) => {
  const rootDir = `temp/aur_${args.version}/`
  fs.removeSync(rootDir)
  fs.ensureDirSync(rootDir)
  fs.outputFileSync(`${rootDir}/PKGBUILD`, PKGBUILD(args))
  $`cd ${rootDir} && makepkg --printsrcinfo > .SRCINFO`
}

export const PKGBUILD = (args) => {
  const {version, download_url, version_hash} = args
  return `
pkgname=erigon
pkgdesc='Ethereum implementation on the efficiency frontier.'
pkgver=${version}
pkgrel=1
epoch=1
url='https://github.com/ledgerwatch/erigon'
arch=('x86_64' 'amd64')
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
