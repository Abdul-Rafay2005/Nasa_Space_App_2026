$nodeDir = "C:\Users\dell\Desktop\nasa_2026\.tools\node"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$nodeDir*") {
    $newPath = "$currentPath;$nodeDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "SUCCESS: Added $nodeDir to User PATH."
} else {
    Write-Host "INFO: $nodeDir is already in User PATH."
}

