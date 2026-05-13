$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$AndroidRoot = Join-Path $RepoRoot 'android'
$LocalAppData = $env:LOCALAPPDATA
if (!$LocalAppData) {
  $LocalAppData = [Environment]::GetFolderPath('LocalApplicationData')
}
if (!$LocalAppData) {
  $LocalAppData = Join-Path $env:USERPROFILE 'AppData\Local'
}
$WritableTemp = Join-Path $LocalAppData 'Temp'

$NodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($NodeCommand) {
  $Node = $NodeCommand.Source
} elseif (Test-Path -LiteralPath 'C:\Program Files\nodejs\node.exe') {
  $Node = 'C:\Program Files\nodejs\node.exe'
} else {
  throw 'node executable not found. Install Node.js 22+ or add node to PATH.'
}

if (!(Test-Path -LiteralPath $AndroidRoot)) {
  throw 'android platform directory not found. Run npm run cap:android:add first.'
}

if (!$env:ANDROID_HOME) {
  $defaultAndroidHome = Join-Path $LocalAppData 'Android\Sdk'
  if (Test-Path -LiteralPath $defaultAndroidHome) {
    $env:ANDROID_HOME = $defaultAndroidHome
  }
}
if (!$env:ANDROID_HOME) {
  throw 'ANDROID_HOME is not set and the default Android SDK path was not found.'
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

if (!$env:JAVA_HOME) {
  $androidStudioJbr = 'C:\Program Files\Android\Android Studio\jbr'
  if (Test-Path -LiteralPath $androidStudioJbr) {
    $env:JAVA_HOME = $androidStudioJbr
  }
}
if (!$env:JAVA_HOME) {
  throw 'JAVA_HOME is not set and Android Studio JBR was not found.'
}

$env:TEMP = $WritableTemp
$env:TMP = $WritableTemp
$env:GRADLE_OPTS = "-Djava.io.tmpdir=$WritableTemp"
$env:_JAVA_OPTIONS = "-Djava.io.tmpdir=$WritableTemp"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\emulator;C:\Windows\System32;C:\Windows;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\Git\cmd;" + (Split-Path -Parent $Node) + ";$env:Path"

$CapCli = Join-Path $RepoRoot 'node_modules\@capacitor\cli\bin\capacitor'
$MobileBuild = Join-Path $RepoRoot 'tools\build-capacitor-web.mjs'
$GradleWrapper = Join-Path $AndroidRoot 'gradlew.bat'
$Apk = Join-Path $AndroidRoot 'app\build\outputs\apk\debug\app-debug.apk'

function Invoke-CheckedProcess {
  param(
    [string]$Label,
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$WorkingDirectory
  )

  Write-Output "--- $Label ---"
  Push-Location $WorkingDirectory
  try {
    $global:LASTEXITCODE = $null
    & $FilePath @Arguments
    $exitCode = $global:LASTEXITCODE
    if ($null -eq $exitCode) {
      if ($?) {
        $exitCode = 0
      } else {
        $exitCode = 1
      }
    }
    if ($exitCode -ne 0) {
      throw "$Label failed with exit code $exitCode"
    }
  } finally {
    Pop-Location
  }
}

Push-Location $RepoRoot
try {
  Write-Output "Node: $Node"
  Write-Output "JAVA_HOME: $env:JAVA_HOME"
  Write-Output "ANDROID_HOME: $env:ANDROID_HOME"
  Write-Output "Gradle temp: $WritableTemp"

  Invoke-CheckedProcess 'mobile web build' $Node @($MobileBuild) $RepoRoot
  Invoke-CheckedProcess 'Capacitor Android sync' $Node @($CapCli, 'sync', 'android') $RepoRoot
  Invoke-CheckedProcess 'Gradle assembleDebug' $GradleWrapper @('assembleDebug', '--no-daemon', '--console=plain') $AndroidRoot

  if (!(Test-Path -LiteralPath $Apk)) {
    throw "APK not found at $Apk"
  }

  $item = Get-Item -LiteralPath $Apk
  Write-Output "APK: $($item.FullName)"
  Write-Output "APK bytes: $($item.Length)"
} finally {
  Pop-Location
}
