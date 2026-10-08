# Run from the extracted v8 folder. Keeps qr-motor and index.html at the same URL.
$ErrorActionPreference = 'Stop'
function Invoke-CheckedGit {
    param([string[]]$GitArgs)
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) { throw "Git failed. No force push will be attempted." }
}
try {
    $sourcePath = $PSScriptRoot
    if (-not (Test-Path -LiteralPath (Join-Path $sourcePath 'index.html'))) {
        throw 'Extract the complete project ZIP before running this script.'
    }
    $desktopPath = [Environment]::GetFolderPath('Desktop')
    $updatePath = Join-Path $desktopPath ('qr-motor-update-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
    Invoke-CheckedGit -GitArgs @('clone','--branch','main','--single-branch','https://github.com/MuhammedCanCeylan/qr-motor.git',$updatePath)
    if (-not (Test-Path -LiteralPath (Join-Path $updatePath 'index.html'))) {
        throw 'The existing main branch has no root index.html. Check the current Pages source before publishing.'
    }
    $originalHead = & git -C $updatePath rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read the existing repository history.' }
    # Never copy .git, replace the Pages workflow or overwrite a custom domain.
    & robocopy $sourcePath $updatePath /E /XD .git .github node_modules /XF CNAME Publish-Update.ps1 /R:1 /W:1 /NFL /NDL /NJH /NJS
    if ($LASTEXITCODE -ge 8) { throw 'Copy failed; publishing stopped.' }
    $copiedHead = & git -C $updatePath rev-parse HEAD
    if ($LASTEXITCODE -ne 0 -or $originalHead -ne $copiedHead) { throw 'Repository history changed during copy; publishing stopped.' }
    Invoke-CheckedGit -GitArgs @('-C',$updatePath,'add','.')
    & git -C $updatePath diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host 'The repository already contains these files.'; exit 0 }
    if ($LASTEXITCODE -ne 1) { throw 'Cannot inspect staged changes.' }
    Invoke-CheckedGit -GitArgs @('-C',$updatePath,'diff','--cached','--stat')
    Invoke-CheckedGit -GitArgs @('-C',$updatePath,'commit','-m','Update PCX Hub v8 - QR visitor arcade')
    Invoke-CheckedGit -GitArgs @('-C',$updatePath,'push','origin','main')
    Write-Host 'Upload complete. The repository name, Pages settings and index.html path were not changed.'
    Write-Host 'Wait for the existing Pages deployment, then test the printed QR link.'
} catch {
    Write-Host ('Stopped: ' + $_.Exception.Message) -ForegroundColor Red
    if ($updatePath) { Write-Host ('Working copy: ' + $updatePath) }
    exit 1
}
