#!/bin/bash
set -e
echo "Starting build process..."
npm install
npm install --save-dev @types/node
npm run build
