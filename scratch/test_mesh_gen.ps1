[System.Reflection.Assembly]::LoadFrom('C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\RasMapperLib.dll') | Out-Null

$baseDir = "C:\HEC_Work\Tehri15km_Base"
$gisDir = "$baseDir\gis"
$geomFile = "$baseDir\Tehri15km.g01"
$terrFile = "$baseDir\Terrain\Tehri15kmTerrain.hdf"
$shpFile = "$gisDir\perimeter.shp"

# Create Geometry
$createCmd = New-Object RasMapperLib.Scripting.CreateGeometryCommand
$createCmd.GeometryFilename = $geomFile
$createCmd.GeometryTitle = "Tehri 15km Canyon Geometry"
$createCmd.UnitSystem = [RasMapperLib.SharedData+EnumUnits]::SIUnits
$ret1 = $createCmd.Execute($null)
Write-Host "CreateGeometryCommand returned: $ret1"

# Associate Terrain
$assocCmd = New-Object RasMapperLib.Scripting.SetGeometryAssociationCommand
$assocCmd.GeometryFilename = $geomFile
$assocCmd.TerrainFilename = $terrFile
$ret2 = $assocCmd.Execute($null)
Write-Host "SetGeometryAssociationCommand returned: $ret2"

# Generate Mesh
$meshCmd = New-Object RasMapperLib.Scripting.GenerateMeshCommand
$meshCmd.GeometryFilename = $geomFile
$meshCmd.PerimeterFilename = $shpFile
$meshCmd.MeshName = "Tehri15kmCanyon"
$meshCmd.CellSize = [single]100.0
$meshCmd.MinFaceLengthRatio = [single]0.05
$ret3 = $meshCmd.Execute($null)
Write-Host "GenerateMeshCommand returned: $ret3"

# Compute Property Tables
$tblCmd = New-Object RasMapperLib.Scripting.ComputePropertyTablesCommand
$tblCmd.Geometry = $geomFile
$ret4 = $tblCmd.Execute($null)
Write-Host "ComputePropertyTablesCommand returned: $ret4"
