import type {SvelteComponent} from 'svelte';

import Dashboard from '$lib/plugins/dashboard/Dashboard.svelte';
import Link from '$lib/plugins/link/Link.svelte';
import Mention from '$lib/plugins/mention/Mention.svelte';
import Vocab from '$lib/plugins/vocab/Vocab.svelte';
import Home from '$lib/plugins/home/Home.svelte';
import PersonalHome from '$lib/plugins/personal-home/PersonalHome.svelte';
import AdminHome from '$lib/plugins/admin-home/AdminHome.svelte';
import InstanceAdmin from '$lib/plugins/instance-admin/InstanceAdmin.svelte';
import AdminSite from '$lib/plugins/admin-site/AdminSite.svelte';
import Chat from '$lib/plugins/chat/Chat.svelte';
import ReplyChat from '$lib/plugins/reply-chat/ReplyChat.svelte';
import Board from '$lib/plugins/board/Board.svelte';
import Forum from '$lib/plugins/forum/Forum.svelte';
import Notes from '$lib/plugins/notes/Notes.svelte';
import Iframe from '$lib/plugins/iframe/Iframe.svelte';
import Mural from '$lib/plugins/mural/Mural.svelte';
import EntityExplorer from '$lib/plugins/entity-explorer/EntityExplorer.svelte';
import Todo from '$lib/plugins/todo/Todo.svelte';
import List from '$lib/plugins/list/List.svelte';
import Lists from '$lib/plugins/lists/Lists.svelte';

// TODO import these dynamically instead of statically like this

export const components: Record<string, typeof SvelteComponent<any>> = {
	// layout components
	Dashboard,
	// widget components
	Link,
	Mention,
	Vocab,
	// view components
	Home,
	PersonalHome,
	AdminHome,
	AdminSite,
	InstanceAdmin,
	Chat,
	ReplyChat,
	Board,
	Forum,
	Notes,
	Iframe,
	Mural,
	EntityExplorer,
	Todo,
	List,
	Lists,
};
