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
  const rootDir = `temp/bin_${args.filename}/`
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
pkgrel=2
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
    make erigon devnet downloader integration rpcdaemon sentry txpool sentinel caplin
}

package() {
    cd ${env("pkgname")}-${env("pkgver")}

    for binary in build/bin/*; do
        filename=\${binary##*/}
        if [[ "\${filename}" = "erigon" ]]; then
            install -Dm755 "${env("binary")}" "\${pkgdir}/usr/bin/\${filename}"
        else
            install -Dm755 "\${binary}" "\${pkgdir}/usr/bin/erigon-\${filename}"
        fi
    done
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
