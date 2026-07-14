$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), 4174)
$listener.Start()

function Get-MimeType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg" { "image/svg+xml" }
    default { "application/octet-stream" }
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if (-not $requestLine) { continue }
      while (($headerLine = $reader.ReadLine()) -ne $null -and $headerLine -ne "") {}

      $parts = $requestLine.Split(" ")
      $method = $parts[0]
      $target = if ($parts.Length -gt 1) { $parts[1] } else { "/" }
      $pathOnly = [System.Uri]::UnescapeDataString(($target.Split("?"))[0]).TrimStart("/")
      if ([string]::IsNullOrWhiteSpace($pathOnly)) { $pathOnly = "index.html" }

      $fullPath = Join-Path $root $pathOnly
      if (Test-Path $fullPath -PathType Container) {
        $fullPath = Join-Path $fullPath "index.html"
      }

      Write-Host "$method $target -> $fullPath"

      if ($method -ne "GET" -or -not (Test-Path $fullPath)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $responseBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($responseBytes, 0, $responseBytes.Length)
        $stream.Write($body, 0, $body.Length)
        continue
      }

      $body = [System.IO.File]::ReadAllBytes($fullPath)
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $(Get-MimeType $fullPath)`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $responseBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($responseBytes, 0, $responseBytes.Length)
      $stream.Write($body, 0, $body.Length)
    }
    finally {
      if ($stream) { $stream.Dispose() }
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
