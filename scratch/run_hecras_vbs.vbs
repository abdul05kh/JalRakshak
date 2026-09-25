Dim ras, prjPath, nmsg, msg(), success, i
Set ras = CreateObject("RAS701.HECRASController")

prjPath = "C:\HEC_Work\TehriSmokeTest\TehriSmokeTest.prj"
WScript.Echo "Opening Project: " & prjPath
ras.Project_Open prjPath

WScript.Echo "Current Project: " & ras.CurrentProjectTitle()
WScript.Echo "Current Plan: " & ras.CurrentPlanFile()
WScript.Echo "Current Geom: " & ras.CurrentGeomFile()

ReDim msg(100)
nmsg = 0

WScript.Echo "Calling Compute_CurrentPlan in VBScript..."
success = ras.Compute_CurrentPlan(nmsg, msg, True)
WScript.Echo "Compute Result Success: " & success
WScript.Echo "Total Messages: " & nmsg

For i = 0 To nmsg - 1
    WScript.Echo "Msg(" & i & "): " & msg(i)
Next

ras.Project_Close
ras.QuitRas
Set ras = Nothing
WScript.Echo "HEC-RAS Controller closed."
