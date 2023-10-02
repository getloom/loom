import {base} from '$app/paths';

/**
 * @see ./tech_stack_diagram.png
 * @see https://mermaid.live/edit
 */
export const tech_stack_diagram = `%%{ init: { 'flowchart': { 'curve': 'monotoneY' } } }%%
flowchart
	subgraph db
		P[(postgres)]
		click P "${base}{path}/guide/dev/data-model"
	end
	subgraph Node backend
		S[Services] -- function calls --> R[Repos]
		R -- queries -->
		P -- data --> R
		R -- data --> S
	end
	subgraph browser frontend
		A[Actions] -- "API requests
		(websockets and RESTful http)" --> S
		S -- "API response and broadcast data" --> A
		C["Views (Svelte components)"] <-- ui --> A
	end`;
