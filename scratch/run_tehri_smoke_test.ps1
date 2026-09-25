param(
    [string]$prjPath = "C:\HEC_Work\TehriSmokeTest\TehriSmokeTest.prj"
)

Write-Host "================================================================="
Write-Host "  GENUINE HEC-RAS 7.0.1 AUTOMATION RUNNER                        "
Write-Host "================================================================="
Write-Host "Opening Project:" $prjPath

$startTime = Get-Date
$ras = New-Object -ComObject "RAS701.HECRASController"
$ras.ShowRas()
$openSuccess = $ras.Project_Open($prjPath)
Write-Host "Project Open Success:" $openSuccess
Write-Host "Project Title:" $ras.CurrentProjectTitle()
Write-Host "Current Plan:" $ras.CurrentPlanFile()
Write-Host "Current Geom:" $ras.CurrentGeomFile()

[int]$nmsg = 0
[string[]]$msg = @()
[bool]$blocking = $true

Write-Host "Launching Compute_CurrentPlan..."
$computeSuccess = $ras.Compute_CurrentPlan([ref]$nmsg, [ref]$msg, $blocking)
$endTime = Get-Date

Write-Host "Compute Complete Status:" $computeSuccess
Write-Host "Total Messages:" $nmsg
for ($i = 0; $i -lt $msg.Length; $i++) {
    Write-Host "  Msg[$i]:" $msg[$i]
}

$ras.Project_Close()
$ras.QuitRas()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ras) | Out-Null

$duration = ($endTime - $startTime).TotalSeconds
Write-Host "Simulation Duration:" $duration "seconds"
Write-Host "================================================================="
