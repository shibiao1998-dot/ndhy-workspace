param([string]$query)
$key = $env:TAVILY_API_KEY
$bodyObj = @{
    api_key = $key
    query = $query
    search_depth = "advanced"
    max_results = 10
    include_answer = $true
}
$body = $bodyObj | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "https://api.tavily.com/search" -Method POST -ContentType "application/json" -Body $body
$resp | ConvertTo-Json -Depth 10
