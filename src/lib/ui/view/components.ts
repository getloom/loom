import type {SvelteComponent} from 'svelte';

import Home from '$lib/ui/view/Home.svelte';
import PersonalHome from '$lib/ui/view/PersonalHome.svelte';
import AdminHome from '$lib/ui/view/AdminHome.svelte';
import InstanceAdmin from '$lib/ui/view/InstanceAdmin.svelte';
import Chat from '$lib/ui/view/Chat.svelte';
import Board from '$lib/ui/view/Board.svelte';
import Forum from '$lib/ui/view/Forum.svelte';
import Notes from '$lib/ui/view/Notes.svelte';
import Iframe from '$lib/ui/view/Iframe.svelte';
import EntityExplorer from '$lib/ui/view/EntityExplorer.svelte';
import Todo from '$lib/ui/view/Todo.svelte';
import Lists from '$lib/mods/ryanatkn/lists/Lists.svelte';

export const viewComponents: Record<string, typeof SvelteComponent> = {
	Home,
	PersonalHome,
	AdminHome,
	InstanceAdmin,
	Chat,
	Board,
	Forum,
	Notes,
	Iframe,
	EntityExplorer,
	Todo,
	Lists, // TODO how to import namespace? maybe this should be a `Mod` or `Plugin` interface in a list?
};
