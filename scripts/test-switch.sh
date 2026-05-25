#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SWITCH_VALUE="${SDK_TEST_SWITCH:-on}"
E2E_SWITCH_VALUE="${SDK_E2E_SWITCH:-off}"

if ! command -v composer >/dev/null 2>&1; then
  echo "Erro: composer nao encontrado no PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Erro: npm nao encontrado no PATH." >&2
  exit 1
fi

is_switch_enabled() {
  case "$2" in
    1|true|TRUE|True|yes|YES|on|ON|enabled|ENABLED) return 0 ;;
    0|false|FALSE|False|no|NO|off|OFF|disabled|DISABLED) return 1 ;;
    *)
      echo "Erro: $1 invalido: '$2'. Use on/off, true/false, 1/0." >&2
      exit 2
      ;;
  esac
}

if ! is_switch_enabled "SDK_TEST_SWITCH" "$SWITCH_VALUE"; then
  echo "SDK_TEST_SWITCH=$SWITCH_VALUE"
  echo "Switch de teste desativado. Validacao do SDK pulada."
  exit 0
fi

if is_switch_enabled "SDK_E2E_SWITCH" "$E2E_SWITCH_VALUE"; then
  E2E_ENABLED=1
else
  E2E_ENABLED=0
fi

echo "SDK_TEST_SWITCH=$SWITCH_VALUE"
echo "Iniciando validacao completa do SDK."
echo

echo "[1/3] PHP SDK"
(
  cd "$ROOT_DIR/php"
  composer test
)

echo
echo "[2/3] TypeScript SDK"
(
  cd "$ROOT_DIR/typescript"
  npm test
)

echo
echo "[3/3] E2E homologacao"
if [ "$E2E_ENABLED" -eq 1 ]; then
  echo "SDK_E2E_SWITCH=$E2E_SWITCH_VALUE"
  (
    cd "$ROOT_DIR/typescript"
    npm run test:e2e
  )
else
  echo "SDK_E2E_SWITCH=$E2E_SWITCH_VALUE"
  echo "Switch E2E desativado. Validacao ponta a ponta pulada."
fi

echo
echo "Validacao do SDK concluida com sucesso."
