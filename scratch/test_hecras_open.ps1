$ras = New-Object -ComObject "RAS701.HECRASController"
$prjPath = "C:\HEC_Work\BaldEagleCrkMulti2D\BaldEagleDamBrk.prj"

Write-Host "Opening Project:" $prjPath
$ras.Project_Open($prjPath)

$curProj = $ras.CurrentProjectTitle()
$curPlan = $ras.CurrentPlanFile()
$curGeom = $ras.CurrentGeomFile()

Write-Host "Project Title:" $curProj
Write-Host "Current Plan:" $curPlan
Write-Host "Current Geom:" $curGeom

$ras.Project_Close()
$ras.QuitRas()
Write-Host "Closed HEC-RAS successfully."
