param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$devPidFile = Join-Path $root ".tmp-stingfit-dev.pid"
$tunnelPidFile = Join-Path $root ".tmp-stingfit-tunnel.pid"

function Stop-ProcessFromPidFile {
  param([string]$PidFile)

  if (-not (Test-Path -LiteralPath $PidFile)) {
    return
  }

  $pidText = (Get-Content -LiteralPath $PidFile -Raw).Trim()
  $procId = 0
  if ([int]::TryParse($pidText, [ref]$procId)) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }

  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

Set-Location -LiteralPath $root

Stop-ProcessFromPidFile -PidFile $tunnelPidFile
Stop-ProcessFromPidFile -PidFile $devPidFile

# Safety fallback: stop remaining listeners on the same port.
$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $listeners) {
  Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Output "Stopped public preview processes on port $Port"
