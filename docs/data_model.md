## Data Model
SQL Database Tables:

```mermaid
classDiagram
  Accounts <|-- Actors
  Actors <|-- Hubs
  Hubs <|-- Actors
  Hubs <|-- Roles
  Actors <|-- Assignments
  Hubs <|-- Assignments
  Roles <|-- Assignments
  Roles <|-- Policies
  Hubs <|-- Spaces
  Spaces <|-- Items
  Items <|-- Items
```