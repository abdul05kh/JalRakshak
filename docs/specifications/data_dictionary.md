# JalRakshak System Data Dictionary

## 1. Hydraulic Simulation Domain
| Variable | Symbol | Unit | Description |
|---|---|---|---|
| Inundation Arrival Time | $A_i$ | seconds | Time from breach initiation to water reaching edge $i$ at depth $> 0.3\text{m}$ |
| Peak Inundation Depth | $h_{peak}$ | meters | Maximum water surface elevation above terrain ground level |
| Peak Flow Velocity | $v_{peak}$ | m/s | Maximum depth-averaged vector velocity |
| Inundation Duration | $t_{dur}$ | hours | Total time cell remains submerged above critical threshold |

## 2. Evacuation Routing Domain
| Variable | Symbol | Unit | Description |
|---|---|---|---|
| Traversal Duration | $T_i$ | seconds | Vehicular transit time across road edge $i$ |
| Safety Contingency Buffer | $B$ | seconds | Reserve buffer allocated for congestion and incident delay ($B=180\text{s}$) |
| Departure Deadline | $D$ | seconds | Latest safe evacuation departure timestamp ($D = \min_i (A_i - T_i - B)$) |
