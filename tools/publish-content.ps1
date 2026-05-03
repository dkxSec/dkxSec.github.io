param(
	[string]$CommitMessage = 'content: update site content',
	[string]$Remote = 'origin',
	[string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'

function Invoke-NativeStep {
	param(
		[Parameter(Mandatory = $true)]
		[string]$Label,
		[Parameter(Mandatory = $true)]
		[scriptblock]$Command
	)

	Write-Host "==> $Label"
	& $Command
	if ($LASTEXITCODE -ne 0) {
		throw "$Label failed with exit code $LASTEXITCODE"
	}
}

Set-Location -LiteralPath (Join-Path $PSScriptRoot '..')

Invoke-NativeStep -Label 'Syncing content' -Command { npm run sync:content }

Invoke-NativeStep -Label 'Building site' -Command { npm run build }

$pathsToStage = @(
	'src/content/posts',
	'public/obsidian-assets',
	'src/data/generated/projects.generated.json',
	'src/data/project-curation.json',
	'tools/publish-content.ps1'
)

$existingPathsToStage = @(
	$pathsToStage | Where-Object { Test-Path -LiteralPath $_ }
)

if ($existingPathsToStage.Count -eq 0) {
	Write-Host 'No publishable paths found. Nothing to stage.'
	exit 0
}

Write-Host '==> Staging content publishing paths'
git add -- $existingPathsToStage
if ($LASTEXITCODE -ne 0) {
	throw "Staging content publishing paths failed with exit code $LASTEXITCODE"
}

git diff --cached --quiet -- $existingPathsToStage
if ($LASTEXITCODE -eq 0) {
	Write-Host 'No staged changes detected. Nothing to commit.'
	exit 0
}

Invoke-NativeStep -Label "Committing with message: $CommitMessage" -Command { git commit -m $CommitMessage }

Invoke-NativeStep -Label "Pushing to $Remote/$Branch" -Command { git push $Remote $Branch }
