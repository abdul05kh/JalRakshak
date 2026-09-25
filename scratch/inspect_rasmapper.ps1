[System.Reflection.Assembly]::LoadFrom('C:\Program Files (x86)\HEC\HEC-RAS\7.0.1\RasMapperLib.dll') | Out-Null
$types = [System.AppDomain]::CurrentDomain.GetAssemblies() | Where-Object { $_.Location -like '*RasMapperLib*' } | Select-Object -ExpandProperty DefinedTypes
$types | Where-Object { $_.Name -like '*Compute*' -or $_.Name -like '*Mesh*' -or $_.Name -like '*Geom*' -or $_.Name -like '*Process*' } | Select-Object FullName
