import type {SvelteComponent} from 'svelte';

import Home from '$lib/plugins/feltcoop/home/Home.svelte';
import PersonalHome from '$lib/plugins/feltcoop/personal-home/PersonalHome.svelte';
import AdminHome from '$lib/plugins/feltcoop/admin-home/AdminHome.svelte';
import InstanceAdmin from '$lib/plugins/feltcoop/instance-admin/InstanceAdmin.svelte';
import Chat from '$lib/plugins/feltcoop/chat/Chat.svelte';
import ReplyChat from '$lib/plugins/greatbacon/reply-chat/ReplyChat.svelte';
import Board from '$lib/plugins/feltcoop/board/Board.svelte';
import Forum from '$lib/plugins/feltcoop/forum/Forum.svelte';
import Notes from '$lib/plugins/feltcoop/notes/Notes.svelte';
import Iframe from '$lib/plugins/feltcoop/iframe/Iframe.svelte';
import EntityExplorer from '$lib/plugins/feltcoop/entity-explorer/EntityExplorer.svelte';
import Todo from '$lib/plugins/feltcoop/todo/Todo.svelte';
import List from '$lib/plugins/ryanatkn/list/List.svelte';
import Lists from '$lib/plugins/ryanatkn/lists/Lists.svelte';

export const viewComponents: Record<string, typeof SvelteComponent> = {
	Home,
	PersonalHome,
	AdminHome,
	InstanceAdmin,
	Chat,
	ReplyChat,
	Board,
	Forum,
	Notes,
	Iframe,
	EntityExplorer,
	Todo,
	List,
	Lists,
};
