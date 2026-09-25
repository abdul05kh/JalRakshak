param(
    [string]$prjPath = "C:\HEC_Work\BaldEagleCrkMulti2D\BaldEagleDamBrk.prj"
)

Write-Host "Opening Bald Eagle Project:" $prjPath

$startTime = Get-Date
$ras = New-Object -ComObject "RAS701.HECRASController"
$ras.ShowRas()
$ras.Project_Open($prjPath)
$ras.Plan_SetCurrent("Single 2D area with Bridges FEQ")

Write-Host "Current Plan:" $ras.CurrentPlanFile()
Write-Host "Current Geom:" $ras.CurrentGeomFile()

[int]$nmsg = 0
[string[]]$msg = [string[]]::new(100) # Preallocate array for COM SAFEARRAY
[bool]$blocking = $true

Write-Host "Launching Compute_CurrentPlan on Bald Eagle..."
$computeSuccess = $ras.Compute_CurrentPlan([ref]$nmsg, [ref]$msg, $blocking)
$endTime = Get-Date

Write-Host "Compute Complete Status:" $computeSuccess
Write-Host "Total Messages:" $nmsg
for ($i = 0; $i -lt [Math]::Min($nmsg, 10); $i++) {
    Write-Host "  Msg[$i]:" $msg[$i]
}

$ras.Project_Close()
$ras.QuitRas()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ras) | Out-Null
Write-Host "Simulation Duration:" ($endTime - $startTime).TotalSeconds "seconds"
