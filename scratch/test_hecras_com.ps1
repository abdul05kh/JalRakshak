$ras = New-Object -ComObject "RAS701.HECRASController"
Write-Host "Instantiated HEC-RAS Controller:" $ras
$methods = $ras | Get-Member -MemberType Method | Select-Object -ExpandProperty Name
Write-Host "Methods count:" $methods.Count
foreach ($m in $methods) {
    if ($m -like "*Project*" -or $m -like "*Compute*" -or $m -like "*Plan*" -or $m -like "*Geom*" -or $m -like "*Run*") {
        Write-Host "  Method: $m"
    }
}
$ras.QuitRas()
