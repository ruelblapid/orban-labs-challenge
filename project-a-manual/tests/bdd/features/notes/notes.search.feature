Feature: Notes Search

  Scenario: Searching notes by tag returns matching notes
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Roadmap" with body "Draft the Q3 roadmap" and tags "work" exists
    When I search notes by tag "work"
    Then the response status code should be 200
    And the response JSON "data" should contain a note titled "Roadmap"

  Scenario: Searching notes by keyword returns matching notes
    Given the FastAPI test client is available
    And I am authenticated as a new user
    And a note titled "Recipe" with body "How to bake sourdough bread" and tags "home" exists
    When I search notes by keyword "sourdough"
    Then the response status code should be 200
    And the response JSON "data" should contain a note titled "Recipe"

  Scenario: Searching notes without a tag or keyword is rejected
    Given the FastAPI test client is available
    And I am authenticated as a new user
    When I search notes without a tag or keyword
    Then the response status code should be 422
