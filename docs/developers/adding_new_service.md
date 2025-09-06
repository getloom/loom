# Adding A New Service
Loom uses the idea of a `service` to describe distinct pieces of business logic handled by the server. They are closely tied to the concept of `vocab`. A new `service` means adding a new `vocab` element.

Adding a new service broadly speaking requires the following things

1) First inside the `src/lib/vcoab` folder add the new vocab term. For the purposes of these docs we will be implementing a new `foo` service.
1) Inside `src/lib/vocab/foo`, the first thing we'll need to do is define the API for the new service action we'll be creating. Inside `src/lib/vocab/foo/fooActions.ts` the action can be defined using JSONSchema notation.
    1) The actual entity interface defintion will also need to be handled in `src/lib/vocab/foo/foo.ts`
1) Inside `src/lib/vocab/foo` create a `fooServices.ts` file. Each function within a service is tied to an `action`, must be identified as involving a transaction (used in the case of DB access), and finally the actual business logic is defined in the `perform` function.
    1) Once your first service function is defined, don't forget to add it to the services map inside `src/lib/server/services.ts`
1) If the `foo` service needs representation within the database, a `fooRepo.ts` should be made for managing SQL queries & DB access. A migration will also need to be setup for adding and modifying the new `foo` table.
1) In order to be accessible from front end views, the service will also need to have its respective mutation created, `src/lib/vocab/foo/fooMutations.js`. These files are responsible for managing the front end state of things when `views` invoke `services`.
    1) Register this mutation in the `src/lib/ui/mutations.ts` file.
1) Various meta files will need to be updated as well.
    1) `src/lib/vocab/vocab.ts`
    1) `src/lib/vocab/metadata.ts`
    1) `src/lib/vocab/action/actionData.ts`
    1) `src/lib/vocab/action/actionTypes.ts`
        1) These are an artifact of when Loom used a now defunct generation function from gro and needed a much wider type surface for doing other system things. This system should probably be refactored.
1) For testing you will also need to set up the function's set of random params inside `src/lib/util/randomActionParams.ts` & `src/lib/util/randomActionParamsTypes.ts`