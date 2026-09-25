using System;
using System.Reflection;
using System.Runtime.InteropServices;

namespace JalRakshak.Inspect {
    class Program {
        static void Main() {
            Type rasType = Type.GetTypeFromProgID("RAS701.HECRASController");
            Console.WriteLine("ProgID Type: " + rasType.FullName);
            
            foreach (MethodInfo m in rasType.GetMethods()) {
                if (m.Name.IndexOf("compute", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    m.Name.IndexOf("plan", StringComparison.OrdinalIgnoreCase) >= 0) {
                    Console.Write(m.ReturnType.Name + " " + m.Name + "(");
                    ParameterInfo[] pars = m.GetParameters();
                    for (int i = 0; i < pars.Length; i++) {
                        Console.Write((pars[i].ParameterType.IsByRef ? "ref " : "") + pars[i].ParameterType.Name + " " + pars[i].Name + (i < pars.Length - 1 ? ", " : ""));
                    }
                    Console.WriteLine(")");
                }
            }
        }
    }
}
