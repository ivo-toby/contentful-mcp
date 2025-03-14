/**
 * Type definitions for Contentful AI Actions
 */

// Variable types
export type VariableType =
  | "ResourceLink"
  | "Text"
  | "StringOptionsList"
  | "FreeFormInput"
  | "StandardInput"
  | "Locale"
  | "MediaReference"
  | "Reference"
  | "SmartContext";

// Entity type for reference variables
export type EntityType = "Entry" | "Asset" | "ResourceLink";

// Variable configuration types
export type StringOptionsListConfiguration = {
  allowFreeFormInput?: boolean;
  values: string[];
};

export type TextConfiguration = {
  strict: boolean;
  in: string[];
};

export type ReferenceConfiguration = {
  allowedEntities: EntityType[];
};

export type VariableConfiguration =
  | StringOptionsListConfiguration
  | TextConfiguration
  | ReferenceConfiguration;

// Variable definition
export interface Variable {
  id: string;
  type: VariableType;
  name?: string;
  description?: string;
  configuration?: VariableConfiguration;
}

// Condition for conditional template sections
export type ConditionOperator = "eq" | "neq" | "in" | "nin";

export interface StringCondition {
  id: string;
  variable: string;
  operator: "eq" | "neq";
  value: string;
}

export interface ArrayCondition {
  id: string;
  variable: string;
  operator: "in" | "nin";
  value: string[];
}

export type Condition = StringCondition | ArrayCondition;

// Instruction that contains the template and variables
export interface Instruction {
  template: string;
  variables: Variable[];
  conditions?: Condition[];
}

// Model configuration
export interface Configuration {
  modelType: string;
  modelTemperature: number;
}

// Input variable value types
export interface TextVariableValue {
  id: string;
  value: string;
}

export interface ReferenceVariableValue {
  id: string;
  value: {
    entityType: EntityType;
    entityId: string;
    entityPath?: string;
    entityPaths?: string[];
  };
}

export type VariableValue = TextVariableValue | ReferenceVariableValue;

// Output format for AI Action results
export type OutputFormat = "RichText" | "Markdown" | "PlainText";

// Invocation request
export interface AiActionInvocationType {
  outputFormat?: OutputFormat;
  variables?: VariableValue[];
}

// AI Action test case
export interface TextTestCase {
  type: "Text";
  value: string;
}

export interface ReferenceTestCase {
  type: "Reference";
  value: {
    entityType: EntityType;
    entityId: string;
    entityPath?: string;
    entityPaths?: string[];
  };
}

export type AiActionTestCase = TextTestCase | ReferenceTestCase;

// Status for invocations and filtering
export type InvocationStatus = "SCHEDULED" | "IN_PROGRESS" | "FAILED" | "COMPLETED" | "CANCELLED";
export type StatusFilter = "all" | "published";

// System links
export interface SysLink {
  sys: {
    id: string;
    linkType: string;
    type: "Link";
  };
}

export interface VersionedLink extends SysLink {
  sys: {
    id: string;
    linkType: string;
    type: "Link";
    version: number;
  };
}

// AI Action entity
export interface AiActionEntity {
  sys: {
    id: string;
    type: "AiAction";
    createdAt: string;
    updatedAt: string;
    version: number;
    space: SysLink;
    createdBy: SysLink;
    updatedBy: SysLink;
    publishedAt?: string;
    publishedVersion?: number;
    publishedBy?: SysLink;
  };
  name: string;
  description: string;
  instruction: Instruction;
  configuration: Configuration;
  testCases?: AiActionTestCase[];
}

export interface AiActionEntityCollection {
  sys: {
    type: "Array";
  };
  items: AiActionEntity[];
  skip?: number;
  limit?: number;
  total?: number;
}

// AI Action creation/update schema
export interface AiActionSchemaParsed {
  name: string;
  description: string;
  instruction: Instruction;
  configuration: Configuration;
  testCases?: AiActionTestCase[];
}

// Rich text components
export interface Mark {
  type: string;
}

export interface Text {
  nodeType: "text";
  value: string;
  marks: Mark[];
  data: Record<string, unknown>;
}

export interface Node {
  nodeType: string;
  data: Record<string, unknown>;
  content: (Node | Text)[];
}

export interface RichTextDocument {
  nodeType: "document";
  data: Record<string, unknown>;
  content: Node[];
}

// Result types
export interface AiActionInvocationMetadata {
  invocationResult: {
    aiAction: VersionedLink;
    outputFormat: OutputFormat;
    promptTokens: number;
    completionTokens: number;
    modelId: string;
    modelProvider: string;
    outputMetadata?: {
      customNodesMap: Record<string, Node>;
    };
  };
  statusChangedDates?: Array<{
    date: string;
    status: InvocationStatus;
  }>;
}

export interface FlowResult {
  type: "text";
  content: string | RichTextDocument;
  metadata: AiActionInvocationMetadata;
}

export interface AiActionInvocation {
  sys: {
    id: string;
    type: "AiActionInvocation";
    space: SysLink;
    environment: SysLink;
    aiAction: SysLink;
    status: InvocationStatus;
    errorCode?: string;
  };
  result?: FlowResult;
}