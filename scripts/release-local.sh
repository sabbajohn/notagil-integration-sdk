#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS_DIR="$ROOT_DIR/typescript"
PACKAGE_NAME="@notagil/integration-sdk"
VERSION="${1:-}"
TAG="${2:-latest}"
OTP="${3:-${NPM_OTP:-}}"

usage() {
  echo "Uso: scripts/release-local.sh <versao> [dist-tag] [otp]" >&2
  echo "Exemplo: scripts/release-local.sh 0.1.4 latest 123456" >&2
  echo "Tambem aceita NPM_OTP=123456 scripts/release-local.sh 0.1.4 latest" >&2
}

if [ -z "$VERSION" ]; then
  usage
  exit 2
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Erro: npm nao encontrado no PATH." >&2
  exit 1
fi

if ! npm whoami >/dev/null 2>&1; then
  echo "Erro: npm nao autenticado. Rode 'npm login' ou configure NPM_TOKEN." >&2
  exit 1
fi

CURRENT_VERSION="$(node -p "require('$TS_DIR/package.json').version")"
if [ "$CURRENT_VERSION" != "$VERSION" ]; then
  echo "Erro: typescript/package.json esta em $CURRENT_VERSION, esperado $VERSION." >&2
  echo "Atualize a versao antes de publicar." >&2
  exit 1
fi

if npm view "$PACKAGE_NAME@$VERSION" version >/dev/null 2>&1; then
  echo "Erro: $PACKAGE_NAME@$VERSION ja existe no npm. Incremente a versao." >&2
  exit 1
fi

echo "Publicando $PACKAGE_NAME@$VERSION com dist-tag '$TAG'."
(
  cd "$TS_DIR"
  npm test
  npm pack --dry-run
  if [ -n "$OTP" ]; then
    npm publish --access public --tag "$TAG" --otp "$OTP"
  else
    npm publish --access public --tag "$TAG"
  fi
)

echo "Release npm publicado: $PACKAGE_NAME@$VERSION"
