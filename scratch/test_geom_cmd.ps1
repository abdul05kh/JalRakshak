[System.Reflection.Assembly]::LoadFrom('C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\RasMapperLib.dll') | Out-Null

Write-Host "Creating 15km Geometry via RasMapperLib..."
$geomFile = "C:\HEC_Work\Tehri15km_Base\Tehri15km.g01"
$terrFile = "C:\HEC_Work\Tehri15km_Base\Terrain\Tehri15kmTerrain.hdf"

New-Item -ItemType Directory -Force -Path "C:\HEC_Work\Tehri15km_Base\Terrain" | Out-Null
Copy-Item "C:\HEC_Work\Tehri15km_Test\Terrain\*" "C:\HEC_Work\Tehri15km_Base\Terrain\" -Force

# Create geometry command
$createCmd = New-Object RasMapperLib.Scripting.CreateGeometryCommand
$createCmd.GeometryFilename = $geomFile
$createCmd.GeometryTitle = "Tehri 15km Canyon Geometry"
$createCmd.UnitSystem = [RasMapperLib.SharedData+EnumUnits]::SIUnits
$createCmd.Execute($null)
Write-Host "Geometry Created: $geomFile"

# Associate Terrain
$assocCmd = New-Object RasMapperLib.Scripting.SetGeometryAssociationCommand
$assocCmd.GeometryFilename = $geomFile
$assocCmd.TerrainFilename = $terrFile
$assocCmd.Execute($null)
Write-Host "Associated with Terrain: $terrFile"
