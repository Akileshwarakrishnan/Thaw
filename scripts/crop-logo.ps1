Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap((Join-Path (Get-Location) "public\thaw-logo.png"))
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$pad = 4
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($bmp.Width - 1, $maxX + $pad)
$maxY = [Math]::Min($bmp.Height - 1, $maxY + $pad)

$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1
Write-Host "Cropping to: W=$cropWidth, H=$cropHeight (X=$minX, Y=$minY)"

$rect = New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)
$bmp.Dispose()

$dest = Join-Path (Get-Location) "public\thaw-logo-cropped.png"
$dest2 = Join-Path (Get-Location) "public\thaw-logo.png"
$cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()

Copy-Item $dest $dest2 -Force
Write-Host "Successfully cropped and updated public\thaw-logo.png"
