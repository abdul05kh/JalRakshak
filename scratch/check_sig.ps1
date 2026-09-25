$ras = New-Object -ComObject "RAS701.HECRASController"
$mem = $ras | Get-Member Compute_CurrentPlan
Write-Host "Definition:" $mem.Definition
$ras.QuitRas()
