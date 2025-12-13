# B2BChat Authentication Error Handling Test Script
# Run this script to test error scenarios

Write-Host "Testing B2BChat Authentication Error Handling" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3002"

# Test 1: Duplicate Email Registration
Write-Host "Test 1: Registration with Duplicate Email" -ForegroundColor Yellow
$body = @{
    name = "Duplicate User"
    email = "test2@example.com"
    password = "anypassword"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✗ FAIL: Should have returned error" -ForegroundColor Red
    Write-Host "Response: $($response.Content)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    if ($statusCode -eq 400 -and $errorBody.error -eq "User already exists") {
        Write-Host "✓ PASS: Correctly returned 400 with 'User already exists'" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Unexpected error" -ForegroundColor Red
        Write-Host "Status: $statusCode" -ForegroundColor Red
        Write-Host "Error: $($errorBody.error)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Missing Required Fields
Write-Host "Test 2: Registration with Missing Fields" -ForegroundColor Yellow
$body = @{
    name = "Test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✗ FAIL: Should have returned error" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    if ($statusCode -eq 400 -and $errorBody.error -eq "Missing required fields") {
        Write-Host "✓ PASS: Correctly returned 400 with 'Missing required fields'" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Unexpected error" -ForegroundColor Red
        Write-Host "Status: $statusCode" -ForegroundColor Red
        Write-Host "Error: $($errorBody.error)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Valid Registration (New User)
Write-Host "Test 3: Valid Registration (New User)" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$body = @{
    name = "Test User $timestamp"
    email = "test$timestamp@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    $user = $response.Content | ConvertFrom-Json
    
    if ($response.StatusCode -eq 201 -and $user.email) {
        Write-Host "✓ PASS: User created successfully" -ForegroundColor Green
        Write-Host "  Email: $($user.email)" -ForegroundColor Gray
        Write-Host "  Name: $($user.name)" -ForegroundColor Gray
    } else {
        Write-Host "✗ FAIL: Unexpected response" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAIL: Registration failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
