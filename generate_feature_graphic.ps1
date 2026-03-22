Add-Type -AssemblyName System.Drawing

$logoPath = "C:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL\frontend\assets\icon.png"
$outPath  = "C:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL\frontend\assets\feature_graphic_1024x500.png"

$W   = 1024
$H   = 500
$pad = 40

$logo = [System.Drawing.Image]::FromFile($logoPath)
$bmp  = New-Object System.Drawing.Bitmap($W, $H)
$g    = [System.Drawing.Graphics]::FromImage($bmp)

$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$availW = $W - ($pad * 2)
$availH = $H - ($pad * 2)
$ratio  = [Math]::Min($availW / $logo.Width, $availH / $logo.Height)
$nW     = [int]($logo.Width  * $ratio)
$nH     = [int]($logo.Height * $ratio)
$x      = [int](($W - $nW) / 2)
$y      = [int](($H - $nH) / 2)

$g.DrawImage($logo, $x, $y, $nW, $nH)
$g.Dispose()
$logo.Dispose()

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Saved: $outPath"
