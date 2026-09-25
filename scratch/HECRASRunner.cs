using System;
using System.Runtime.InteropServices;

namespace JalRakshak.HECRAS {
    class Program {
        static int Main(string[] args) {
            if (args.Length < 1) {
                Console.WriteLine("Usage: HECRASRunner.exe <project_path>");
                return 1;
            }

            string prjPath = args[0];
            Console.WriteLine("=== HEC-RAS 7.0.1 COM EXECUTION RUNNER ===");
            Console.WriteLine("Opening Project: " + prjPath);

            Type rasType = Type.GetTypeFromProgID("RAS701.HECRASController");
            if (rasType == null) {
                Console.WriteLine("ERROR: Could not find ProgID RAS701.HECRASController");
                return 2;
            }

            dynamic ras = Activator.CreateInstance(rasType);
            try {
                ras.ShowRas();
                ras.Project_Open(prjPath);

                Console.WriteLine("Project Title: " + (string)ras.CurrentProjectTitle());
                Console.WriteLine("Current Plan:  " + (string)ras.CurrentPlanFile());
                Console.WriteLine("Current Geom:  " + (string)ras.CurrentGeomFile());

                int nmsg = 0;
                Array msg = new string[5000];
                bool blocking = true;

                Console.WriteLine("Invoking Compute_CurrentPlan...");
                DateTime startTime = DateTime.Now;
                bool success = (bool)ras.Compute_CurrentPlan(ref nmsg, ref msg, blocking);
                DateTime endTime = DateTime.Now;

                Console.WriteLine("Compute Succeeded: " + success);
                Console.WriteLine("Execution Time:    " + (endTime - startTime).TotalSeconds + " s");
                Console.WriteLine("Total Messages:    " + nmsg);

                string[] strMsg = (string[])msg;
                for (int i = 0; i < Math.Min(nmsg, strMsg.Length); i++) {
                    if (!string.IsNullOrEmpty(strMsg[i])) {
                        Console.WriteLine("  [" + i + "]: " + strMsg[i]);
                    }
                }

                ras.Project_Close();
                ras.QuitRas();
                Console.WriteLine("HEC-RAS Execution Finished with status: " + (success ? "SUCCESS" : "FAILED"));
                return success ? 0 : 3;
            } catch (Exception ex) {
                Console.WriteLine("FATAL COM EXCEPTION: " + ex.ToString());
                try {
                    ras.Project_Close();
                    ras.QuitRas();
                } catch {}
                return 4;
            } finally {
                Marshal.ReleaseComObject(ras);
            }
        }
    }
}
