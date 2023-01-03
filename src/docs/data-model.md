# Data Model

This document provides a layout of Felt's core SQL database tables:

```mermaid
    classDiagram
        Accounts <|-- Personas
        Personas <|-- Communities
        Communities <|-- Personas
        Communities <|-- Roles
        Roles <|-- Assigments
        Personas <|-- Assigments
        Roles <|-- Policies
        Communities <|-- Spaces
        Spaces <|-- Entities
        Entities <|-- Ties
        Ties <|-- Entities
```
