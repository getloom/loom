# Entities & Ties

While most `vocab` terms are related to the platform system of Loom, one set of vocab terms stands apart. These are `Entities` & `Ties`.

## Entities
`Entities` are a generic object stored within the context of a `Space` within a `Hub`. They can be anything from a simple text message, to SVG layer data, to anything else you might want to track a single record of.

## Ties
`Ties` then, are the relationship between two `Entities` tracking a from/to relationship and including a term for describing the relationship as well.

## Theory
In this way, generally complex user features can be built out from the `View` context of loom. The `View` is responsible for understanding the form and relation of `Entities` & `Ties` and creates order out of them through its front end code.

Theoretically then, the same data set of `Entities` & `Ties` can be created and managed, but appear as arbitrarily different experiences through the use of swapping `Views`.

From a practical perspective, this mostly allows for users to design their own tools to install on the platform without having to actually deal with direct database access or arbitary SQL exectuion.