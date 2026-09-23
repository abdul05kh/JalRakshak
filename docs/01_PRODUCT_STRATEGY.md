# 01 — Product Strategy, Requirement Deconstruction and Scope

## 1. Problem interpretation
The SIH26161 problem requires translating terrain data, user-defined dam breach conditions, and hydraulic modelling into spatial-temporal flood intelligence.
- **Physics layer:** calculate how flood water propagates.
- **Decision layer:** translate that propagation into operationally interpretable consequences.
- **Presentation layer:** communicate the result without pretending to be a certified emergency-control system.

## 2. Product promise
**"Turn a hydraulic flood forecast into a time-bounded evacuation decision without altering the underlying physics model."**

## 3. Flagship feature: Evacuation Window Engine (EWE)
For every candidate route:
- compute travel time;
- sample flood arrival time along the route;
- identify the earliest route point where `arrival_time <= travel_time_to_point + safety_buffer`;
- calculate the latest departure time that satisfies the configured rule;
- expose the limiting segment;
- explain the decision.

## 4. Visual product principle
- white/light interface;
- restrained typography;
- no random gradients, glassmorphism, or decorative 3D;
- strong map-first hierarchy;
- explicit units and timestamps.
