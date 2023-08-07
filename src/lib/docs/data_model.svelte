<script lang="ts">
	import Mermaid from '$lib/ui/Mermaid.svelte';
</script>

<div class="prose">
	<h2>Data model</h2>
	<p>felt's SQL database tables:</p>
	<Mermaid
		content={`classDiagram
    Accounts <|-- Actors
    Actors <|-- Hubs
    Hubs <|-- Actors
    Hubs <|-- Roles
    Roles <|-- Assignments
    Actors <|-- Assignments
    Roles <|-- Policies
    Hubs <|-- Spaces
    Spaces <|-- Entities
    Entities <|-- Entities
    Entities <|-- Ties`}
	/>
</div>
