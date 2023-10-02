/**
 * @see ./control_overview_diagram.png
 * @see https://mermaid.live/edit
 */
export const control_overview_diagram = `flowchart
	subgraph Infrastructure
		O[Operators] -- delegate control --> A
		subgraph Instance
			U[Users] -- access --> C
			S[Stewards] -- steward --> C[Hubs]
			A[Admins] -- administer --> C
			A -- delegate control --> S
		end
	end
	Infrastructure -- host --> Instance
	O -- manage infrastructure --> O
	A -- manage instance --> A`;
