param(
  [int]$Port = 4173,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$previewLog = Join-Path $root ".tmp-stingfit-mobile-preview.log"
$previewErrLog = Join-Path $root ".tmp-stingfit-mobile-preview.err.log"
$previewPidFile = Join-Path $root ".tmp-stingfit-mobile-preview.pid"
$previewUrlFile = Join-Path $root ".tmp-stingfit-mobile-preview-url.txt"
$svgOutput = Join-Path $root "public\stingfit-mobile-preview-qr.svg"
$pngOutput = Join-Path $root "public\stingfit-mobile-preview-qr.png"

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

function Test-LocalPort {
  param([int]$PortToCheck)

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync("127.0.0.1", $PortToCheck)
    if (-not $task.Wait(300)) {
      return $false
    }

    return $client.Connected
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Wait-ForPreviewPort {
  param(
    [int]$PortToCheck,
    [int]$TimeoutSeconds = 45,
    [int]$IntervalMilliseconds = 400
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-LocalPort -PortToCheck $PortToCheck) {
      return $true
    }
    Start-Sleep -Milliseconds $IntervalMilliseconds
  }

  return $false
}

function Get-LanIpv4Candidates {
  function Get-AddressRank {
    param([string]$Address)

    if ($Address.StartsWith("192.168.")) { return 4 }
    if ($Address.StartsWith("10.")) { return 3 }
    if ($Address -match "^172\.(1[6-9]|2[0-9]|3[01])\.") { return 2 }
    if ($Address -match "^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.") { return 1 }
    return 0
  }

  $candidates = foreach ($networkInterface in [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
    if ($networkInterface.OperationalStatus -ne [System.Net.NetworkInformation.OperationalStatus]::Up) {
      continue
    }

    $properties = $networkInterface.GetIPProperties()
    $hasIpv4Gateway = $properties.GatewayAddresses | Where-Object {
      $_.Address.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
      $_.Address.ToString() -ne "0.0.0.0"
    } | Select-Object -First 1

    foreach ($unicastAddress in $properties.UnicastAddresses) {
      if (
        $unicastAddress.Address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork -or
        [System.Net.IPAddress]::IsLoopback($unicastAddress.Address) -or
        $unicastAddress.Address.ToString().StartsWith("169.254.")
      ) {
        continue
      }

      $address = $unicastAddress.Address.ToString()
      $interfaceRank = switch ($networkInterface.NetworkInterfaceType) {
        ([System.Net.NetworkInformation.NetworkInterfaceType]::Wireless80211) { 3 }
        ([System.Net.NetworkInformation.NetworkInterfaceType]::Ethernet) { 2 }
        default { 0 }
      }
      $gatewayRank = if ($hasIpv4Gateway) { 20 } else { 0 }

      [pscustomobject]@{
        Address = $address
        Rank = $gatewayRank + $interfaceRank + (Get-AddressRank -Address $address)
        Name = $networkInterface.Name
      }
    }
  }

  $addresses = $candidates |
    Sort-Object -Property @{ Expression = { $_.Rank }; Descending = $true }, @{ Expression = { $_.Name }; Descending = $false } |
    ForEach-Object { $_.Address } |
    Select-Object -Unique

  if (-not $addresses) {
    return @("127.0.0.1")
  }

  return @($addresses)
}

Set-Location -LiteralPath $root

Stop-ProcessFromPidFile -PidFile $previewPidFile

if (-not $SkipBuild) {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    throw "Production build failed. Fix the build before mobile PWA smoke testing."
  }
}

foreach ($path in @($previewLog, $previewErrLog, $previewUrlFile)) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
  }
}

$previewProc = Start-Process `
  -FilePath "npm.cmd" `
  -ArgumentList @("run", "preview", "--", "--host", "0.0.0.0", "--port", "$Port") `
  -WorkingDirectory $root `
  -RedirectStandardOutput $previewLog `
  -RedirectStandardError $previewErrLog `
  -PassThru

Set-Content -LiteralPath $previewPidFile -Value $previewProc.Id -Encoding ascii

if (-not (Wait-ForPreviewPort -PortToCheck $Port -TimeoutSeconds 45)) {
  throw "Production preview did not start on port $Port. Check $previewLog and $previewErrLog."
}

$lanIps = @(Get-LanIpv4Candidates)
$previewUrls = @($lanIps | ForEach-Object { "http://$_`:$Port/#/training" })
$previewUrl = $previewUrls[0]
Set-Content -LiteralPath $previewUrlFile -Value $previewUrls -Encoding ascii

node .\tools\generate-preview-qr.mjs --url $previewUrl --out $svgOutput | Out-Null
npx qrcode -t png -w 512 -o $pngOutput $previewUrl | Out-Null

Write-Output "MOBILE_PWA_URL=$previewUrl"
if ($previewUrls.Count -gt 1) {
  Write-Output "MOBILE_PWA_URL_CANDIDATES=$($previewUrls -join ', ')"
}
Write-Output "QR_PNG=$pngOutput"
Write-Output "QR_SVG=$svgOutput"
Write-Output "PREVIEW_LOG=$previewLog"
Write-Output "PREVIEW_ERR_LOG=$previewErrLog"
Write-Output "PID_FILE=$previewPidFile"
Write-Output "Open the URL or scan the QR on a phone connected to the same local network. Stop with: npm run mobile:pwa:stop"
