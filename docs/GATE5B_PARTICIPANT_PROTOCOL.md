# GATE 5B — PARTICIPANT PROTOCOL & ETHICAL FRAMEWORK

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** PROTOCOL SPECIFICATION FROZEN  
**Date:** 2026-09-24  

---

## 1. Study Purpose & Scope

The purpose of this controlled exploratory study is to evaluate whether JalRakshak’s decision-oriented evacuation window representation enables participants to retrieve and interpret route-feasibility information more effectively and with clearer awareness of limitations than raw hydrodynamic simulation outputs.

### Explicit Non-Claims & Ethical Disclosures:
- **No Real Emergency:** This is an academic/engineering desktop evaluation using frozen, simulated dam-break demonstration scenarios.
- **No Real Evacuation Orders:** The tasks involve synthetic decision scenarios; no real-world evacuation or civil defense consequences exist.
- **No Participant Deception:** Participants are explicitly informed about the nature of the comparison, the underlying assumptions, and the simulation boundaries.
- **Voluntary Participation:** Participation is strictly voluntary with the right to withdraw at any time without penalty.

---

## 2. Participant Eligibility & Classification

Participants are categorized honestly based on their actual background. **Under no circumstances are general testers labeled as "Emergency Officers".**

### Allowed Categories:
1. `STUDENT_CIVIL_HYDRAULIC` — Civil, Environmental, or Water Resources Engineering students.
2. `STUDENT_COMPUTER_SCIENCE` — Computer Science / Software Engineering students.
3. `GIS_DISASTER_LEARNER` — Students or practitioners in GIS, Remote Sensing, or Disaster Management.
4. `DOMAIN_ENGINEER_FACULTY` — Practicing engineers, researchers, or academic faculty.
5. `NON_DOMAIN_GENERAL` — General technical participants without specialized hydraulic training.

---

## 3. Data Privacy & Anonymization

- **No Personal Identifiers:** No names, phone numbers, employee IDs, or email addresses are stored.
- **Anonymized Identifiers:** Each participant is assigned a random pseudonym identifier: `P001`, `P002`, `P003`, etc.
- **Data Retention:** Only task completion timestamps, selected radio options, textual justifications, and qualitative feedback are recorded in structured JSON/CSV format.

---

## 4. Participant Briefing Script

The study administrator reads the following standardized script to each participant before beginning:

> *"Thank you for participating in this research study. Today, you will review simulated flood scenarios for a 15-kilometer river reach downstream of a large dam. You will be asked to answer specific questions regarding road route feasibility, departure deadlines, and limiting constraints under two different information representations.*
> 
> *Please note:*
> 1. *This study evaluates the clarity and completeness of software representations, NOT your individual intelligence.*
> 2. *All data represents frozen numerical simulations on demonstration datasets; physical validation against real dam breaks has not been established.*
> 3. *The term 'FEASIBLE' means mathematically traversable under the model's static speed and safety-buffer rules; it does NOT mean 'GUARANTEED SAFE'.*
> 4. *You may take as much or as little time as needed to reach a decision. You may stop at any time."*
