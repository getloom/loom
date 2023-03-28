# Data Model

This document provides a layout of Felt's core SQL database tables:

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
        Entities <|-- Ties
        Ties <|-- Entities
```
