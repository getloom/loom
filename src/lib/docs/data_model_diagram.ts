/**
 * @see ./data_model_diagram.png
 * @see https://mermaid.live/edit
 */
export const data_model_diagram = `classDiagram
  Accounts <|-- Actors
  Actors <|-- Hubs
  Hubs <|-- Actors
  Hubs <|-- Roles
  Roles <|-- Assignments
  Actors <|-- Assignments
  Roles <|-- Policies
  Hubs <|-- Spaces
  Spaces <|-- Entities
  Entities <|-- Entities`;
