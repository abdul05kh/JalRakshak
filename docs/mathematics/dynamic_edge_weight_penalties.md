# Dynamic Edge Weighting Formulation for Mountainous Networks

## 1. Topographic Slope Factor
For a road edge $e$ with vertical elevation change $\Delta h_e$ and horizontal distance $L_e$:
$$\theta_e = \arctan\left(\frac{\Delta h_e}{L_e}\right)$$

The uphill impedance coefficient $\phi_{slope}(\theta_e)$ is formulated as:
$$\phi_{slope}(\theta_e) = \begin{cases} 
1.0 & \theta_e \le 0 \\
1.0 + 3.5 \sin^2(\theta_e) & \theta_e > 0 
\end{cases}$$

## 2. Weather & Monsoon Degradation
Let $\omega \in [0, 1]$ represent torrential rainfall precipitation intensity:
$$v_{eff}(e) = v_{nominal}(e) \cdot (1 - 0.35\omega) \cdot \frac{1}{\phi_{slope}(\theta_e)}$$
