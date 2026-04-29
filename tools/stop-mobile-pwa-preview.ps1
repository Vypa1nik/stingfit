$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$previewPidFile = Join-Path $root ".tmp-stingfit-mobile-preview.pid"
$previewUrlFile = Join-Path $root ".tmp-stingfit-mobile-preview-url.txt"

if (-not (Test-Path -LiteralPath $previewPidFile)) {
  Remove-Item -LiteralPath $previewUrlFile -Force -ErrorAction SilentlyContinue
  Write-Output "No StingFit mobile PWA preview PID file found."
  exit 0
}

$pidText = (Get-Content -LiteralPath $previewPidFile -Raw).Trim()
$procId = 0
if ([int]::TryParse($pidText, [ref]$procId)) {
  $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
  if ($null -ne $proc) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Output "Stopped StingFit mobile PWA preview process $procId."
  } else {
    Write-Output "StingFit mobile PWA preview process $procId was not running."
  }
} else {
  Write-Output "StingFit mobile PWA preview PID file was invalid."
}

Remove-Item -LiteralPath $previewPidFile -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $previewUrlFile -Force -ErrorAction SilentlyContinue
