#!/usr/bin/env bash

set -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)
readonly distFolder=${currentDir}/dist

export NODE_PATH=${NODE_PATH:-}:${currentDir}/node_modules
VERBOSE=false
TRACE=false

source ${currentDir}/scripts/ci/_ghactions-group.sh
source ${currentDir}/util-functions.sh

ghActionsGroupStart "clean dist" "no-xtrace"
rm -rf ${distFolder}
ghActionsGroupEnd "clean dist"

mkdir -p ${distFolder}

ghActionsGroupStart "build package" "no-xtrace"

logInfo "Execute \`npm run transform-icons\` command"
npm run transform-icons

logInfo "Copy essential files in dist"
syncOptions=(-a --include="README.md" --include="NOTICE" --include="LICENSE" --include="package.json" --exclude="*" --exclude="**/*")
syncFiles ${currentDir} ${distFolder} "${syncOptions[@]}"
unset syncOptions

logInfo "Remove unnecessary properties from package.json in dist"
jq 'del(.devDependencies, .scripts, .config)' dist/package.json > dist/package.json.tmp \
  && mv dist/package.json.tmp dist/package.json

logInfo "Generate npm package (tgz file)"
cd ${distFolder} > /dev/null
npm pack ./ --silent

ghActionsGroupEnd "build package"
