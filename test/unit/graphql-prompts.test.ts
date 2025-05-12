import { expect, vi, describe, it } from "vitest"
import { graphqlHandlers } from "../../src/prompts/promptHandlers/graphql"

describe("GraphQL Prompts Handlers", () => {
  it("should generate explore schema prompt with goal", () => {
    const result = graphqlHandlers["explore-graphql-schema"]({ goal: "articles" })
    
    expect(result).to.have.property("messages").that.is.an("array")
    expect(result.messages).to.have.lengthOf(2)
    
    // Check assistant message
    expect(result.messages[0].role).to.equal("assistant")
    expect(result.messages[0].content.text).to.include("GraphQL schema explorer")
    
    // Check user message
    expect(result.messages[1].role).to.equal("user")
    expect(result.messages[1].content.text).to.include("articles")
  })
  
  it("should generate explore schema prompt without goal", () => {
    const result = graphqlHandlers["explore-graphql-schema"]({})
    
    expect(result).to.have.property("messages").that.is.an("array")
    expect(result.messages).to.have.lengthOf(2)
    
    // Check user message should have default content
    expect(result.messages[1].role).to.equal("user")
    expect(result.messages[1].content.text).to.include("different types of content")
  })
  
  it("should generate build query prompt with all parameters", () => {
    const result = graphqlHandlers["build-graphql-query"]({
      contentType: "Article",
      fields: "title,body,publishDate",
      filters: "publishDate > 2023-01-01",
      includeReferences: "true"
    })
    
    expect(result).to.have.property("messages").that.is.an("array")
    expect(result.messages).to.have.lengthOf(2)
    
    // Check user message contains all parameters
    expect(result.messages[1].role).to.equal("user")
    expect(result.messages[1].content.text).to.include("Article")
    expect(result.messages[1].content.text).to.include("title,body,publishDate")
    expect(result.messages[1].content.text).to.include("publishDate > 2023-01-01")
    expect(result.messages[1].content.text).to.include("including any referenced content")
  })
  
  it("should require contentType parameter for build query prompt", () => {
    const result = graphqlHandlers["build-graphql-query"]({})
    
    expect(result).to.have.property("messages").that.is.an("array")
    expect(result.messages).to.have.lengthOf(1)
    
    // Should show error about missing contentType
    expect(result.messages[0].content.text).to.include("need to know which content type")
  })
  
  it("should generate build query prompt with minimal parameters", () => {
    const result = graphqlHandlers["build-graphql-query"]({
      contentType: "Article"
    })
    
    expect(result).to.have.property("messages").that.is.an("array")
    expect(result.messages).to.have.lengthOf(2)
    
    // Check user message with default values
    expect(result.messages[1].role).to.equal("user")
    expect(result.messages[1].content.text).to.include("Article")
    expect(result.messages[1].content.text).to.include("all relevant fields")
    // Should not include filter or reference text
    expect(result.messages[1].content.text).not.to.include("filter")
    expect(result.messages[1].content.text).not.to.include("reference")
  })
})