$ErrorActionPreference = 'Stop'

Set-Location -LiteralPath (Join-Path $PSScriptRoot '..')
node .\node_modules\astro\bin\astro.mjs preview
