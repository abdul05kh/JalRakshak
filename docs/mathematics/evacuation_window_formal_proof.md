# Formal Mathematical Proof of Evacuation Window Optimization

## 1. Problem Formulation
Let $G = (V, E)$ be a directed graph representing the regional evacuation road network in Tehri Garhwal.
- $V$: Set of intersection vertices, origin settlements $S \subset V$, and high-ground shelters $H \subset V$.
- $E$: Set of directed road segments $e = (u, v)$.

For each segment $e \in E$, let:
- $T_e$: Nominal vehicular traversal time over edge $e$ under congested conditions.
- $A_e$: Water inundation arrival timestamp at the most vulnerable geometric coordinate along edge $e$, derived from 2D HEC-RAS unsteady flow solutions.
- $B$: Safety contingency buffer ($B = 180\text{ s}$).

## 2. Inundation Feasibility Inequality
For any valid evacuation departure time $t_{dep}$ along a candidate path $P = (e_1, e_2, \dots, e_k)$:
The arrival timestamp at edge $e_j$ is given by:
$$t_{arr}(e_j) = t_{dep} + \sum_{i=1}^{j} T_{e_i}$$

For safe traversal without submergence, the operator must guarantee:
$$t_{arr}(e_j) + B \le A_{e_j} \quad \forall j \in \{1, \dots, k\}$$

## 3. Departure Deadline Theorem
Rearranging terms yields:
$$t_{dep} \le A_{e_j} - \sum_{i=1}^{j} T_{e_i} - B \quad \forall j \in \{1, \dots, k\}$$

Therefore, the maximum safe departure deadline $D(P)$ is strictly:
$$D(P) = \min_{j=1..k} \left( A_{e_j} - \sum_{i=1}^{j} T_{e_i} - B \right)$$

The edge $e^* = \arg\min_j \left( A_{e_j} - \sum_{i=1}^{j} T_{e_i} - B \right)$ is uniquely defined as the **Limiting Segment**. $\blacksquare$
