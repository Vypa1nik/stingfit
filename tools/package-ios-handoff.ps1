$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$OutputRoot = Join-Path $RepoRoot '.stingfit-mobile-handoff'
$StagingRoot = Join-Path $OutputRoot 'stingfit-ios-capacitor-handoff'
$ZipPath = Join-Path $OutputRoot 'stingfit-ios-capacitor-handoff.zip'

$excludedDirectoryNames = @(
  '.git',
  '.pi',
  '.pi-lens',
  '.playwright-mcp',
  '.ruff_cache',
  '.stingfit-mobile-handoff',
  '.superpowers',
  'android',
  'coverage',
  'dist',
  'dist-ssr',
  'ios',
  'node_modules',
  'output',
  'src-tauri'
)

$excludedRelativePrefixes = @(
  'docs/archive/'
)

$excludedFileNamePatterns = @(
  '.tmp-*',
  '*.log',
  '*.tsbuildinfo',
  '*preview-qr.png',
  '*preview-qr.svg'
)

function Convert-ToRelativePath([string]$Path) {
  $rootPrefix = $RepoRoot.TrimEnd('\') + '\'
  if (!$Path.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Path is outside repository root: $Path"
  }
  return $Path.Substring($rootPrefix.Length).Replace('\', '/')
}

function Test-IncludedFile([System.IO.FileInfo]$File) {
  $relativePath = Convert-ToRelativePath $File.FullName
  foreach ($prefix in $excludedRelativePrefixes) {
    if ($relativePath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $false
    }
  }
  foreach ($pattern in $excludedFileNamePatterns) {
    if ($File.Name -like $pattern) {
      return $false
    }
  }
  return $true
}

function Test-IncludedDirectory([System.IO.DirectoryInfo]$Directory) {
  return $excludedDirectoryNames -notcontains $Directory.Name
}

Remove-Item -LiteralPath $StagingRoot -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $ZipPath -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $StagingRoot -Force | Out-Null

$pending = [System.Collections.Generic.Queue[System.IO.DirectoryInfo]]::new()
$pending.Enqueue([System.IO.DirectoryInfo]::new($RepoRoot))

while ($pending.Count -gt 0) {
  $directory = $pending.Dequeue()

  foreach ($childDirectory in Get-ChildItem -LiteralPath $directory.FullName -Directory -Force) {
    if (Test-IncludedDirectory $childDirectory) {
      $pending.Enqueue($childDirectory)
    }
  }

  foreach ($file in Get-ChildItem -LiteralPath $directory.FullName -File -Force) {
    if (!(Test-IncludedFile $file)) {
      continue
    }
    $relativePath = Convert-ToRelativePath $file.FullName
    $target = Join-Path $StagingRoot $relativePath
    $targetDir = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $target -Force
  }
}

Compress-Archive -Path (Join-Path $StagingRoot '*') -DestinationPath $ZipPath -CompressionLevel Optimal -Force
Remove-Item -LiteralPath $StagingRoot -Recurse -Force -ErrorAction SilentlyContinue
$hash = Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256
Write-Output "Created $ZipPath"
Write-Output "SHA256 $($hash.Hash)"
