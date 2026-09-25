$ras = New-Object -ComObject "RAS701.HECRASController"
$prj2 = "C:\HEC_Work\TehriSmokeTest_Run2\TehriSmokeTest.prj"
$ras.Project_Open($prj2)
Write-Host "Run 2 Project Title:" $ras.CurrentProjectTitle()
Write-Host "Run 2 Geom File:" $ras.CurrentGeomFile()
Write-Host "Run 2 Plan File:" $ras.CurrentPlanFile()
$ras.Project_Close()
$ras.QuitRas()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ras) | Out-Null
Write-Host "HEC-RAS 7.0.1 successfully opened and closed the Run 2 Tehri project!"
