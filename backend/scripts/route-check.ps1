$base='http://localhost:5050'
$paths = @('/api/health','/api/users','/api/projects','/api/tasks','/api/stats/overview')
foreach ($p in $paths) {
  try {
    $res = Invoke-WebRequest -UseBasicParsing -Uri "$base$p" -Method GET
    Write-Output "$p -> $($res.StatusCode) $($res.Content)"
  } catch {
    Write-Output "$p -> ERR $($_.Exception.Message)"
  }
}
# POST validation checks
try {
  $res = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/users" -Method POST -ContentType 'application/json' -Body '{"name":"Test User","email":"test@example.com"}'
  Write-Output "POST /api/users -> $($res.StatusCode) $($res.Content)"
} catch {
  Write-Output "POST /api/users -> ERR $($_.Exception.Message)"
}
try {
  $res = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/ai/suggest-tasks" -Method POST -ContentType 'application/json' -Body '{"goal":"Build a login page"}'
  Write-Output "POST /api/ai/suggest-tasks -> $($res.StatusCode) $($res.Content.Substring(0,200))"
} catch {
  Write-Output "POST /api/ai/suggest-tasks -> ERR $($_.Exception.Message)"
}
try {
  $res = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/ai/summarize-project" -Method POST -ContentType 'application/json' -Body '{"projectId":"not-a-uuid"}'
  Write-Output "POST /api/ai/summarize-project -> $($res.StatusCode) $($res.Content)"
} catch {
  Write-Output "POST /api/ai/summarize-project -> $($_.Exception.Response.StatusCode.value__)"
}
# 404 check
try {
  $res = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/nonexistent" -Method GET
  Write-Output "GET /api/nonexistent -> $($res.StatusCode)"
} catch {
  Write-Output "GET /api/nonexistent -> $($_.Exception.Response.StatusCode.value__)"
}
