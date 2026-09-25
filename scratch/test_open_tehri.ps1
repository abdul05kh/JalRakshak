$ras = New-Object -ComObject "RAS701.HECRASController"
$prj = "C:\HEC_Work\TehriSmokeTest\TehriSmokeTest.prj"
$ras.Project_Open($prj)
Write-Host "Project Title:" $ras.CurrentProjectTitle()
Write-Host "Geom File:" $ras.CurrentGeomFile()
Write-Host "Plan File:" $ras.CurrentPlanFile()
$ras.Project_Close()
$ras.QuitRas()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ras) | Out-Null
Write-Host "HEC-RAS 7.0.1 successfully opened and closed the Tehri project!"
