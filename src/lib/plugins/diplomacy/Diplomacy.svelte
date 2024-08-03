<script lang="ts">
	import type { EntityId } from "$lib/vocab/entity/entity";

    type Country = "Austria-Hungary" | "Great Britain" | "France" | "Germany" | "Italy" | "Russia" | "Turkey" | "nuetral"

    interface Territory {
        name: string;
        type: "land" | "sea";
        owner: Country;
        supply: boolean;
        neighbors: EntityId[];
        land_unit?: EntityId;
        coast1?: EntityId;
        coast2?: EntityId;
        starting?: Country;
    }


    const territories: Territory[] = [
        {
            name: "Ankara",
            type: "land",
            owner: "Turkey",
            supply: true,
            neighbors: [],
            coast1: 1
        }
    ]
</script>