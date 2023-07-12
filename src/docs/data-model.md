# Data Model

This document describes felt-server's SQL database tables:

```mermaid
    classDiagram
        Accounts <|-- Actors
        Actors <|-- Hubs
        Hubs <|-- Actors
        Hubs <|-- Roles
        Roles <|-- Assigments
        Actors <|-- Assigments
        Roles <|-- Policies
        Hubs <|-- Spaces
        Spaces <|-- Entities
        Entities <|-- Entities
        Entities <|-- Ties
```
