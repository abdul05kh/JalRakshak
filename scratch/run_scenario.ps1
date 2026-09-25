param(
    [string]$prjPath = "C:\HEC_Work\TehriExecutionSmokeTest_Run1\TehriSmokeTest.prj"
)

$hdfPath = $prjPath -replace '\.prj$', '.p01.hdf'
if (Test-Path $hdfPath) { Remove-Item $hdfPath -Force }

Write-Host "Opening Project in HEC-RAS 7.0.1:" $prjPath
$ras = New-Object -ComObject "RAS701.HECRASController"
$ras.ShowRas()
$ras.Project_Open($prjPath)
$ras.Compute_ShowComputationWindow()
$ras.ComputeStartedFromController = $true
$ret = $ras.Compute_CurrentPlan()
Write-Host "Compute started:" $ret

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if ((Test-Path $hdfPath) -and ((Get-Item $hdfPath).Length -gt 100000)) {
        Write-Host "HDF5 Generated successfully at t=$($i+1)s! Size: $((Get-Item $hdfPath).Length) bytes"
        Start-Sleep -Seconds 1
        break
    }
}

$ras.Project_Close()
$ras.QuitRas()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ras) | Out-Null
Write-Host "Completed run for:" $prjPath
