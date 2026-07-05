# run-backend.ps1 - Launcher for the Spring Boot Backend

$MavenVersion = "3.9.6"
$MavenFolder = "apache-maven-$MavenVersion"
$MavenZip = "maven.zip"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"

# Resolve absolute path of current folder
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if local Maven exists
if (-not (Test-Path $MavenFolder)) {
    Write-Host "Maven not found locally. Downloading portable version ($MavenVersion)..."
    
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $MavenUrl -OutFile $MavenZip -UseBasicParsing
        
        Write-Host "Extracting Maven..."
        Expand-Archive -Path $MavenZip -DestinationPath "." -Force
        
        # Cleanup zip
        Remove-Item $MavenZip -Force
        Write-Host "Maven successfully set up."
    } catch {
        Write-Host "Failed to download and extract Maven: $_"
        exit
    }
}

# Run Spring Boot application using local Maven
Write-Host "Launching Employee Feedback Spring Boot App..."
& ".\$MavenFolder\bin\mvn.cmd" clean spring-boot:run
