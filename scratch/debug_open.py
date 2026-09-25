import sys
import comtypes.client

prj = r"C:\HEC_Work\TehriGate3_Central\TehriGate3.prj"
print(f"1. Creating HEC-RAS COM Object...")
sys.stdout.flush()
ras = comtypes.client.CreateObject('RAS701.HECRASController')

print(f"2. Calling ShowRas()...")
sys.stdout.flush()
ras.ShowRas()

print(f"3. Calling Project_Open({prj})...")
sys.stdout.flush()
ras.Project_Open(prj)

print(f"4. Project Opened successfully! Title: {ras.CurrentProjectTitle()}")
sys.stdout.flush()

ras.Project_Close()
ras.QuitRas()
print("5. Closed successfully.")
