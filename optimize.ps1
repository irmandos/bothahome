# Ensure necessary directories exist
New-Item -Path "optimized/images/low" -ItemType Directory -Force
New-Item -Path "optimized/images/high" -ItemType Directory -Force

# Load System.Drawing to get image dimensions
Add-Type -AssemblyName "System.Drawing"

# Loop through all image files (jpg, jpeg, png) in the assets/images folder
foreach ($file in Get-ChildItem -Path .\assets\images\ -Include *.jpg, *.jpeg, *.png -Recurse) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    # Open the image to get its dimensions
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    $originalWidth = $image.Width
    $originalHeight = $image.Height

    # Calculate new height based on desired width for low and high-quality images
    # Low-quality image (600px width)
    $newWidthLow = 600
    $newHeightLow = [math]::Round($originalHeight * ($newWidthLow / $originalWidth))
    # Generate low-quality WebP image
    .\node_modules\.bin\sharp -i $file.FullName -o .\optimized\images\low\$base.webp resize $newWidthLow $newHeightLow

    # High-quality image (1200px width)
    $newWidthHigh = 1200
    $newHeightHigh = [math]::Round($originalHeight * ($newWidthHigh / $originalWidth))
    # Generate high-quality WebP image
    .\node_modules\.bin\sharp -i $file.FullName -o .\optimized\images\high\$base.webp resize $newWidthHigh $newHeightHigh

    # Dispose the image object to free up resources
    $image.Dispose()
}

# Update the index.html for lazy loading and WebP path replacement
$htmlFile = ".\index.html"
$content = Get-Content $htmlFile

# Replace image sources with WebP versions and add 'lazy' class and 'data-src' attribute
$content = $content -replace '(<img[^>]+src=")([^"]+)(\.[a-z]+)"', '$1$2.webp"$3 class="lazy" data-src="$2.webp"'

# Save the updated content back to index.html
Set-Content $htmlFile $content

# Ensure the lazy-load.js file is added to the HTML, if not already present
$jsFile = ".\assets\js\lazy-load.js"
$jsScriptTag = "<script src=""$jsFile""></script>"

# Check if the script tag is already in the HTML, if not, append it
if ($content -notmatch [regex]::Escape($jsScriptTag)) {
    $content = $content -replace '</body>', "$jsScriptTag`r`n</body>"
    Set-Content $htmlFile $content
}

# Minify CSS files in the assets/css/ folder
$cssFiles = Get-ChildItem -Path .\assets\css\ -Filter *.css

foreach ($cssFile in $cssFiles) {
    $cssContent = Get-Content $cssFile.FullName -Raw
    # Minify CSS: Removing extra spaces, new lines, etc.
    $minifiedCss = $cssContent -replace '\s+', ' ' -replace ';\s*', ';' -replace '}\s*', '}'
    # Save minified version back
    Set-Content -Path $cssFile.FullName -Value $minifiedCss
}

Write-Host "Image optimization, HTML update with lazy loading, and CSS minification completed successfully!"
