Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL\frontend\assets\icon.png"
$resBase = "C:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL\frontend\android\app\src\main\res"

function Make-Icon {
    param([string]$outPath, [int]$size, [bool]$round = $false)
    
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $canvas = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 10% padding on each side
    $padding = [int]($size * 0.10)
    $drawSize = $size - ($padding * 2)

    # Scale proportionally
    $ratio = [Math]::Min($drawSize / $src.Width, $drawSize / $src.Height)
    $newW = [int]($src.Width * $ratio)
    $newH = [int]($src.Height * $ratio)
    $x = [int](($size - $newW) / 2)
    $y = [int](($size - $newH) / 2)

    if ($round) {
        # Apply circular clip for round icons
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        $g.SetClip($path)
    }

    $g.DrawImage($src, $x, $y, $newW, $newH)
    $g.Dispose()
    $src.Dispose()

    $dir = Split-Path $outPath
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    Write-Host "Created: $outPath ($size x $size)"
}

# Sizes: ldpi=36, mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
$densities = @(
    @{ name = "mipmap-ldpi";    size = 36 },
    @{ name = "mipmap-mdpi";    size = 48 },
    @{ name = "mipmap-hdpi";    size = 72 },
    @{ name = "mipmap-xhdpi";   size = 96 },
    @{ name = "mipmap-xxhdpi";  size = 144 },
    @{ name = "mipmap-xxxhdpi"; size = 192 }
)

foreach ($d in $densities) {
    $folder = "$resBase\$($d.name)"
    Make-Icon -outPath "$folder\ic_launcher.png"       -size $d.size -round $false
    Make-Icon -outPath "$folder\ic_launcher_round.png" -size $d.size -round $true
    Make-Icon -outPath "$folder\ic_launcher_foreground.png" -size $d.size -round $false
}

# Play Store 512x512 icon (with more padding for official requirements)
$ps512 = "C:\Users\Jinang Jain\OneDrive\Desktop\AABA_FINAL\frontend\assets\playstore_icon_512x512.png"
Make-Icon -outPath $ps512 -size 512 -round $false
Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Play Store icon saved to: $ps512"
Write-Host "Upload this file to Play Console > Store listing > App icon"
