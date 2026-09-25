[System.Reflection.Assembly]::LoadFrom('C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\RasMapperLib.dll') | Out-Null

Write-Host "=== CreateGeometryCommand ==="
[RasMapperLib.Scripting.CreateGeometryCommand].GetProperties() | Select-Object Name, PropertyType

Write-Host "=== GenerateMeshCommand ==="
[RasMapperLib.Scripting.GenerateMeshCommand].GetProperties() | Select-Object Name, PropertyType

Write-Host "=== SetGeometryAssociationCommand ==="
[RasMapperLib.Scripting.SetGeometryAssociationCommand].GetProperties() | Select-Object Name, PropertyType

Write-Host "=== ComputePropertyTablesCommand ==="
[RasMapperLib.Scripting.ComputePropertyTablesCommand].GetProperties() | Select-Object Name, PropertyType
