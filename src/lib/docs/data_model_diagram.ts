/**
 * @see ./data_model_diagram.png
 * @see https://mermaid.live/edit
 */
export const data_model_diagram = `classDiagram
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
  Items <|-- Items`;
