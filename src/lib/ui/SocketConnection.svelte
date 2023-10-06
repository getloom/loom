<script lang="ts">
	import {onDestroy} from 'svelte';
	import {browser} from '$app/environment';

	import type {SocketStore} from '$lib/ui/socket.js';
	import {getApp} from '$lib/ui/app.js';

	const {
		ui: {session},
	} = getApp();

	export let socket: SocketStore;
	export let url: string;

	$: ({guest} = $session);

	onDestroy(() => {
		socket.disconnect();
	});

	// Keep the socket connected when signed in, and disconnect when signed out.
	$: if (browser) {
		if (guest) {
			socket.disconnect();
		} else {
			socket.connect(url);
		}
	}
</script>
