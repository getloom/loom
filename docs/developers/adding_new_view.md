# Adding A New View
Once you are set up and running your Loom instance locally, it's time to dig into the fun stuff & start developing Views.

A `View` is a frontend abstraction that describes a collection of `*.svelte` files that provide end user functionality within the Loom platform. They are often 1:1 with a Loom `Space`.

When they are loaded in on the frontend, they make requests to the backend server (based on the `Space` context they are being loaded within) to retrieve a collection of `Entities` & `Ties` to render for the user. 

First class `Views` live in the [plugins directory](../../src/lib/plugins/). It is currently on the roadmap to also develop a system which will allow for 3rd party plugins to be developed and installed to instances outside the core development loop of the Loom team.

## Create the View Files
Once you have a name and use cases in mind for your view, start by creating a folder with the name of the view inside the [plugins directory](../../src/lib/plugins/). Most views will start with three files: `<Name>.svelte`, `<Name>Items.svelte`, & `<Name>Item.svelte`.

1) `<Name>` is the root file that is loaded first by the front end. It is responsible for retrieving entities related to the View from the Space context, managing their state & the high level state of the View, and ultimately passing the core `Entities` down to the `<Name>Items.svelte` file.
1) `<Name>Items.svelte` this is mostly an intermediary piece, responsible for derefrencing `Entity` stores to pass to the actual `<Name>Item.svelte` component
1) `<Name>Item.svelte` is the low level component responsible for managing the rendering and state of a singular, discreet `Entity` within the view.

> More complex `Views` will probably have more files than this, but there must always be 1 and only 1 `<Name>.svelte` file!

## Register the View
Once you've initialized your View (but probably before you actually begin development) you'll want to make sure the View is registered with the system.

1) Import the View's root file (`<Name>.svelte`) in [components.ts](../../src/lib/ui/components.ts) & add it to the components object.
1) You'll need to add the `<Name>` to the `vocabNames` & `viewNames` arrays inside [metadata.ts](../../src/lib/vocab/metadata.ts).
1) You'll need to also add it to the `VocabName` type in [vocab.ts](../../src/lib/vocab/vocab.ts)
1) Optionally, if you want Users to be able to create new versions of this View inside new Spaces, you'll want to add it to the `viewTemplates` object inside [view.ts](../../src/lib/vocab/view/view.ts)

