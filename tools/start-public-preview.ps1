param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$devLog = Join-Path $root ".tmp-stingfit-dev.log"
$devErrLog = Join-Path $root ".tmp-stingfit-dev.err.log"
$tunnelLog = Join-Path $root ".tmp-stingfit-tunnel.log"
$tunnelErrLog = Join-Path $root ".tmp-stingfit-tunnel.err.log"
$devPidFile = Join-Path $root ".tmp-stingfit-dev.pid"
$tunnelPidFile = Join-Path $root ".tmp-stingfit-tunnel.pid"
$publicUrlFile = Join-Path $root ".tmp-stingfit-public-url.txt"
$svgOutput = Join-Path $root "public\stingfit-preview-qr.svg"
$pngOutput = Join-Path $root "public\stingfit-preview-qr.png"

function Stop-ProcessFromPidFile {
  param([string]$PidFile)

  if (-not (Test-Path -LiteralPath $PidFile)) {
    return
  }

  $pidText = (Get-Content -LiteralPath $PidFile -Raw).Trim()
  if ([string]::IsNullOrWhiteSpace($pidText)) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    return
  }

  $procId = 0
  if (-not [int]::TryParse($pidText, [ref]$procId)) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    return
  }

  $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
  if ($null -ne $proc) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }

  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

function Wait-ForCondition {
  param(
    [scriptblock]$Predicate,
    [int]$TimeoutSeconds = 45,
    [int]$IntervalMilliseconds = 400
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $value = & $Predicate
    if ($null -ne $value -and $value -ne $false -and $value -ne "") {
      return $value
    }
    Start-Sleep -Milliseconds $IntervalMilliseconds
  }

  return $null
}

function Get-LatestPublicTunnelUrl {
  param([string]$LogPath)

  if (-not (Test-Path -LiteralPath $LogPath)) {
    return $null
  }

  $content = Get-Content -LiteralPath $LogPath -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($content)) {
    return $null
  }

  $match = [regex]::Matches($content, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
  if ($match.Count -gt 0) {
    return $match[$match.Count - 1].Value
  }

  $match = [regex]::Matches($content, "https://[a-zA-Z0-9-]+\.loca\.lt")
  if ($match.Count -eq 0) {
    return $null
  }

  return $match[$match.Count - 1].Value
}

Set-Location -LiteralPath $root

Stop-ProcessFromPidFile -PidFile $tunnelPidFile

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1

if ($null -eq $listener) {
  if (Test-Path -LiteralPath $devLog) {
    Remove-Item -LiteralPath $devLog -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $devErrLog) {
    Remove-Item -LiteralPath $devErrLog -Force -ErrorAction SilentlyContinue
  }

  $devProc = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0", "--port", "$Port") `
    -WorkingDirectory $root `
    -RedirectStandardOutput $devLog `
    -RedirectStandardError $devErrLog `
    -PassThru

  Set-Content -LiteralPath $devPidFile -Value $devProc.Id -Encoding ascii
}

$listening = Wait-ForCondition -Predicate {
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
} -TimeoutSeconds 45

if ($null -eq $listening) {
  throw "Dev server did not start on port $Port. Check $devLog"
}

if (Test-Path -LiteralPath $tunnelLog) {
  Remove-Item -LiteralPath $tunnelLog -Force -ErrorAction SilentlyContinue
}
if (Test-Path -LiteralPath $tunnelErrLog) {
  Remove-Item -LiteralPath $tunnelErrLog -Force -ErrorAction SilentlyContinue
}

$tunnelProc = Start-Process `
  -FilePath "cloudflared" `
  -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$Port", "--no-autoupdate") `
  -WorkingDirectory $root `
  -RedirectStandardOutput $tunnelLog `
  -RedirectStandardError $tunnelErrLog `
  -PassThru

Set-Content -LiteralPath $tunnelPidFile -Value $tunnelProc.Id -Encoding ascii

$publicUrl = Wait-ForCondition -Predicate {
  $fromErr = Get-LatestPublicTunnelUrl -LogPath $tunnelErrLog
  if ($fromErr) {
    return $fromErr
  }

  return Get-LatestPublicTunnelUrl -LogPath $tunnelLog
} -TimeoutSeconds 60
if (-not $publicUrl) {
  throw "Public URL was not created. Check $tunnelLog"
}

Set-Content -LiteralPath $publicUrlFile -Value $publicUrl -Encoding ascii

node .\tools\generate-preview-qr.mjs --url $publicUrl --out $svgOutput | Out-Null
npx qrcode -t png -w 512 -o $pngOutput $publicUrl | Out-Null

Write-Output "PUBLIC_URL=$publicUrl"
Write-Output "PNG=$pngOutput"
Write-Output "SVG=$svgOutput"
Write-Output "DEV_LOG=$devLog"
Write-Output "DEV_ERR_LOG=$devErrLog"
Write-Output "TUNNEL_LOG=$tunnelLog"
Write-Output "TUNNEL_ERR_LOG=$tunnelErrLog"
