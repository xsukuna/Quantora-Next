$root = "."
$extensions = @("*.tsx","*.ts","*.css","*.json","*.md","*.mjs","*.sql","*.html","*.txt","*.env","*.env.local")
$files = Get-ChildItem -Path $root -Recurse -Include $extensions -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next" }

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($null -eq $content) { continue }
    if ($content -match "(?i)Quantora Analytics") {
        $new = $content `
            -replace "QUANTORA ANALYTICS", "QUANTORA-NEXT" `
            -replace "Quantora Analytics", "Quantora-NEXT" `
            -replace "quantora analytics", "quantora-next"
        Set-Content $file.FullName $new -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
        $count++
    }
}
Write-Host "`nDone! Updated $count files."
