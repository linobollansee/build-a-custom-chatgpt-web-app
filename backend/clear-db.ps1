# Clear Database and Restart Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clear Database & Restart Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running node processes for this backend
Write-Host "Stopping any running server processes..." -ForegroundColor Yellow
$processes = Get-Process -Name node,nodemon -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($proc in $processes) {
        try {
            $proc | Stop-Process -Force
            Write-Host "  Stopped process: $($proc.Name) (PID: $($proc.Id))" -ForegroundColor Green
        } catch {
            Write-Host "  Could not stop process $($proc.Id)" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "  No running server processes found" -ForegroundColor Gray
}

Write-Host ""

# Remove the database file
Write-Host "Deleting database file..." -ForegroundColor Yellow
if (Test-Path "chat.db") {
    Remove-Item "chat.db" -Force
    Write-Host "  Database deleted successfully!" -ForegroundColor Green
} else {
    Write-Host "  No database file found (chat.db doesn't exist)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Starting server with fresh database..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
