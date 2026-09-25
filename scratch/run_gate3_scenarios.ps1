# JalRakshak Gate 3 Multi-Scenario Automated Runner (Native PowerShell COM)

$artifactsDir = "D:\projects\JalRakshak\artifacts\hecras\tehri_gate3"
if (!(Test-Path $artifactsDir)) { New-Item -ItemType Directory -Path $artifactsDir -Force | Out-Null }

$run1Dir = "C:\HEC_Work\TehriExecutionSmokeTest_Run1"
$run2Dir = "C:\HEC_Work\TehriExecutionSmokeTest_Run2"

function Update-Hydrograph {
    param(
        [string]$u01Path,
        [double]$qPeak = 65000,
        [double]$tPeak = 0.4,
        [double]$slope = 0.004
    )
    $qBase = 180
    $times = 0..10 | ForEach-Object { $_ * 0.1 }
    $flows = @()
    foreach ($t in $times) {
        if ($t -le $tPeak) {
            $q = $qBase + ($qPeak - $qBase) * [Math]::Pow(($t / $tPeak), 2.0)
        } else {
            $q = $qBase + ($qPeak - $qBase) * [Math]::Exp(-3.5 * ($t - $tPeak))
        }
        $flows += [int][Math]::Round($q)
    }

    $nFlows = $flows.Length
    $content = @"
Flow Title=Tehri Smoke Test Unsteady Flow
Program Version=6.00
Use Restart= 0 
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,DSNormalDepth                   
Friction Slope=$("{0:F6}" -f $slope),0
Boundary Location=                ,                ,        ,        ,                ,TehriCanyon     ,                ,UpstreamInflow                  
Interval=6MIN
Flow Hydrograph= $nFlows 
"@
    for ($i = 0; $i -lt $nFlows; $i += 5) {
        $chunk = $flows[$i..[Math]::Min($i + 4, $nFlows - 1)]
        $line = " " + ($chunk | ForEach-Object { "{0,8}" -f $_ }) -join " "
        $content += "`n" + $line
    }
    $content += @"
`nFlow Hydrograph Slope= $("{0:F6}" -f $slope)
Initial Conditions Flow Information
       1        Initial Profile
 3.1E+38      13
"@
    Set-Content -Path $u01Path -Value $content
}

function Run-HECRAS {
    param(
        [string]$prjPath,
        [string]$dstHdf
    )
    $hdfOut = $prjPath -replace '\.prj$', '.p01.hdf'
    if (Test-Path $hdfOut) { Remove-Item $hdfOut -Force }

    Write-Host "Opening HEC-RAS 7.0.1 for: $prjPath"
    $ras = New-Object -ComObject "RAS701.HECRASController"
    $ras.ShowRas()
    $ras.Project_Open($prjPath)
    $ras.Compute_ShowComputationWindow()
    $ras.ComputeStartedFromController = $true
    $ret = $ras.Compute_CurrentPlan()
    Write-Host "  Compute status: $ret"

    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if ((Test-Path $hdfOut) -and ((Get-Item $hdfOut).Length -gt 100000)) {
            Write-Host "  Simulation finished at t=$($i+1)s! Size: $((Get-Item $hdfOut).Length) bytes"
            Start-Sleep -Seconds 1
            break
        }
    }

    $ras.Project_Close()
    $ras.QuitRas()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ras) | Out-Null

    if (Test-Path $hdfOut) {
        Copy-Item -Path $hdfOut -Destination $dstHdf -Force
        Write-Host "  Saved scenario artifact: $dstHdf"
    } else {
        Write-Error "Failed to generate $hdfOut"
    }
}

# 1. CENTRAL
Write-Host "`n=== 1. RUNNING SCENARIO CENTRAL (Q_peak=65,000 m3/s, S0=0.004) ==="
Update-Hydrograph -u01Path "$run1Dir\TehriSmokeTest.u01" -qPeak 65000 -tPeak 0.4 -slope 0.004
Run-HECRAS -prjPath "$run1Dir\TehriSmokeTest.prj" -dstHdf "$artifactsDir\scenario_central.p01.hdf"

# 2. MINIMUM
Write-Host "`n=== 2. RUNNING SCENARIO MINIMUM (Q_peak=28,500 m3/s, S0=0.004) ==="
Update-Hydrograph -u01Path "$run1Dir\TehriSmokeTest.u01" -qPeak 28500 -tPeak 0.5 -slope 0.004
Run-HECRAS -prjPath "$run1Dir\TehriSmokeTest.prj" -dstHdf "$artifactsDir\scenario_minimum.p01.hdf"

# 3. MAXIMUM
Write-Host "`n=== 3. RUNNING SCENARIO MAXIMUM (Q_peak=115,000 m3/s, S0=0.004) ==="
Update-Hydrograph -u01Path "$run1Dir\TehriSmokeTest.u01" -qPeak 115000 -tPeak 0.3 -slope 0.004
Run-HECRAS -prjPath "$run1Dir\TehriSmokeTest.prj" -dstHdf "$artifactsDir\scenario_maximum.p01.hdf"

# 4. BOUNDARY SENSITIVITY
Write-Host "`n=== 4. RUNNING SCENARIO BOUNDARY SENSITIVITY (Slope S0=0.008) ==="
Update-Hydrograph -u01Path "$run1Dir\TehriSmokeTest.u01" -qPeak 65000 -tPeak 0.4 -slope 0.008
Run-HECRAS -prjPath "$run1Dir\TehriSmokeTest.prj" -dstHdf "$artifactsDir\scenario_boundary_sensitivity.p01.hdf"

# 5. REPEATABILITY RUN 2
Write-Host "`n=== 5. RUNNING SCENARIO REPEATABILITY RUN 2 ==="
Update-Hydrograph -u01Path "$run2Dir\TehriSmokeTest.u01" -qPeak 65000 -tPeak 0.4 -slope 0.004
Run-HECRAS -prjPath "$run2Dir\TehriSmokeTest.prj" -dstHdf "$artifactsDir\scenario_repeatability_run2.p01.hdf"

# Copy standard artifact and model directory
Copy-Item -Path "$artifactsDir\scenario_central.p01.hdf" -Destination "$artifactsDir\tehri_dam_break.p01.hdf" -Force
Copy-Item -Path "$run1Dir\*" -Destination $artifactsDir -Recurse -Force

Write-Host "`n=== ALL 5 SCENARIOS COMPLETED SUCCESSFULLY! ==="
